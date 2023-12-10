import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';

export class SignUpAuthDto {
  @IsNotEmpty()
  public firstName: string;

  @IsNotEmpty()
  public lastName: string;

  @IsNotEmpty()
  public username: string;

  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsString()
  @MinLength(8, { message: 'Password length must be at least 8 characters' })
  public password: string;

  @IsString()
  @IsNotEmpty()
  public token: string;
}
