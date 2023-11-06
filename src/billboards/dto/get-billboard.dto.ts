import { IsString } from 'class-validator';

export class GetBillboardDto {
  @IsString()
  public slug?: string;

  @IsString()
  public uid?: string;
}
