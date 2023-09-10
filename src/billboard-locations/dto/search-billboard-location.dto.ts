import { IsString } from 'class-validator';

export class SearchBillboardLocationDto {
  @IsString()
  public search?: string;
}
