import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEmail,
  IsOptional,
  ValidateIf,
  IsBoolean,
  IsNotEmptyObject,
} from 'class-validator';
import { User } from '../user/user.model';
import { IsTermsAccepted } from 'src/validators/check-terms.decorator';

interface checkT {
  email?: string;
  username?: string;
}

export class SignUpDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/(?:(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).*)/, {
    message: 'Password must be strong (1 upper, 1 lower, 1 digit)',
  })
  password: string;

  @IsBoolean()
  @IsTermsAccepted()
  terms: boolean;
}

export class SignInDto {
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @ValidateIf((o: checkT) => !o.email && !!o.username) // Only validate if email is not provided
  username?: string;

  @IsOptional()
  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })
  @ValidateIf((o: checkT) => !o.username && !!o.email) // Only validate if username is not provided
  email?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/(?:(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).*)/, {
    message: 'Password must be strong (1 upper, 1 lower, 1 digit)',
  })
  password: string;

  @IsOptional()
  @IsBoolean()
  remember: boolean;

  @ValidateIf((o: checkT) => !o.username && !o.email)
  @IsNotEmptyObject(
    {},
    { message: 'Either username or email must be provided' },
  )
  _dummy?: object; // Dummy field to trigger validation
}

export interface AuthResponseDto {
  accessToken: string;
  user: Omit<User, 'password'>;
}
