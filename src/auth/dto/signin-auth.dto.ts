import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class SignInAuthDto {
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public password: string;
}
