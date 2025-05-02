import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user/user.schema'; // Updated to use the Mongoose schema
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signUp({
    username,
    email,
    password,
  }: AuthCredentialsDto): Promise<void> {
    // Check if the user already exists
    const existingUser = await this.userModel
      .findOne({
        $or: [{ username }, { email }],
      })
      .exec();

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('Username already exists');
      }
      if (existingUser.email === email) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash the password and save the user to the database
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
  }

  async signIn({
    username,
    password,
  }: Omit<AuthCredentialsDto, 'email'>): Promise<{ accessToken: string }> {
    const user = await this.userModel.findOne({ username }).exec();
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const payload = { id: String(user._id), username };
      const accessToken = await this.jwtService.signAsync(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Login failed');
    }
  }
}
