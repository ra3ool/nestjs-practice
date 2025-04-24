import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './user.model';
import { AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    // TODO: Replace with your actual user validation logic
    // This is just an example
    const user: User = {
      id: '1',
      username: 'rasool',
      password: await bcrypt.hash('Pass1234', 10),
    };

    if (
      username === user.username &&
      (await bcrypt.compare(password, user.password))
    ) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User, 'password'>): Promise<AuthResponseDto> {
    const payload = {
      username: user.username,
      sub: user.id,
    };
    const accessToken = await this.jwtService.sign(payload);
    return { accessToken };
  }
}
