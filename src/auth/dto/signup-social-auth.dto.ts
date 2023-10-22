import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class SignUpSocialAuthDto {
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
  @IsNotEmpty()
  public token: string;
}
