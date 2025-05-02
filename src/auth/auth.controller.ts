import { Body, Controller, Post } from '@nestjs/common';
import { AuthCredentialsDto, AuthResponseDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() dto: AuthCredentialsDto): Promise<void> {
    return this.authService.signUp(dto);
  }

  @Post('/signin')
  signIn(
    @Body() dto: Omit<AuthCredentialsDto, 'email'>,
  ): Promise<AuthResponseDto> {
    return this.authService.signIn(dto);
  }
}
