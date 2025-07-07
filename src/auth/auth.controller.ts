import { Body, Controller, Post } from '@nestjs/common';
import { SignUpDto, SignInDto, AuthResponseDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() dto: SignUpDto): Promise<AuthResponseDto> {
    return this.authService.signUp(dto);
  }

  @Post('/signin')
  signIn(@Body() dto: SignInDto): Promise<AuthResponseDto> {
    return this.authService.signIn(dto);
  }
}
