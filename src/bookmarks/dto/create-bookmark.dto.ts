import { IsNumberString } from 'class-validator';

export class CreateBookmarkDto {
  @IsNumberString()
  public billboardId: string;
}
