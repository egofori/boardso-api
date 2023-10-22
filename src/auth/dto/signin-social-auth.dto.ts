import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class SignInSocialAuthDto {
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public token: string;
}
