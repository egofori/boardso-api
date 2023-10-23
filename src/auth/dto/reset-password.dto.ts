import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  public token: string;

  @IsNotEmpty()
  @IsString()
  public password: string;
}
