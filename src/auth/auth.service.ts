import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AuthResponseDto, SignInDto, SignUpDto } from './dto/auth.dto';
import { User } from './user/user.entity';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<AuthResponseDto> {
    try {
      await this.checkUserExistence(signUpDto.username, signUpDto.email);

      const hashedPassword = await this.hashPassword(signUpDto.password);
      const newUser = await this.createUser({
        ...signUpDto,
        password: hashedPassword,
      });

      return this.generateAuthResponse(newUser);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async signIn(signInDto: SignInDto): Promise<AuthResponseDto> {
    try {
      const user = await this.findUserForSignIn(signInDto);

      if (
        !user ||
        !(await this.validatePassword(signInDto.password, user.password))
      ) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Login failed');
    }
  }

  private async checkUserExistence(
    username: string,
    email: string,
  ): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });
    if (existingUser) {
      throw new ConflictException(
        existingUser.email === email
          ? 'Email already exists'
          : 'Username already exists',
      );
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return await (
      bcrypt as unknown as {
        hash: (a: string, b: number) => Promise<string>;
      }
    ).hash(password, this.SALT_ROUNDS);
  }

  private async createUser(
    userData: Omit<SignUpDto, 'password'> & { password: string },
  ): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  private async findUserForSignIn({
    username,
    email,
  }: SignInDto): Promise<User | null> {
    return this.userRepository.findOne({
      where: username ? { username } : { email },
    });
  }

  private async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await (
      bcrypt as unknown as {
        compare: (a: string, b: string) => Promise<boolean>;
      }
    ).compare(plainPassword, hashedPassword);
  }

  private async generateAuthResponse(user: User): Promise<AuthResponseDto> {
    const { id, username, email, role } = user;
    const userObject = { id, username, email, role: role || 'user' };
    const accessToken = await this.jwtService.signAsync(userObject);
    return {
      accessToken,
      user: userObject,
    };
  }
}
