import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  public oldPassword?: string | null;

  @IsNotEmpty()
  @IsString()
  public password: string;
}
