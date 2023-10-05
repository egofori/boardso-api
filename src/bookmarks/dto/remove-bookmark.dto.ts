import { IsNumberString } from 'class-validator';

export class RemoveBookmarkDto {
  @IsNumberString()
  public billboardId: string;
}
