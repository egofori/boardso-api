import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';

export class SignInAuthDto {
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsString()
  @MinLength(8, { message: 'Password length must be at least 8 characters' })
  public password: string;
}
