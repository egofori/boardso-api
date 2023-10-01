import { ContactType } from '@prisma/client';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserContactDto {
  @IsString()
  @IsNotEmpty()
  public title: string;

  @IsString()
  @IsNotEmpty()
  public type: ContactType;

  @IsNotEmpty()
  @IsArray()
  public contacts: string[];
}
