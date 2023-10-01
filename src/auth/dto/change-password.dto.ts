import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  public oldPassword: string;

  @IsNotEmpty()
  @IsString()
  public password: string;
}
