import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(32)
  @Matches(/(?:(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).*)/, {
    message: 'Password must be strong (1 upper, 1 lower, 1 digit)',
  })
  password: string;
}

export class AuthResponseDto {
  accessToken: string;
}
