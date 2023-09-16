import { IsString } from 'class-validator';

export class FindUserDto {
  @IsString()
  public username: string;
}
