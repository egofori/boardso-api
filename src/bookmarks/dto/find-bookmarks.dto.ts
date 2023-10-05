import { IsString, IsNumber } from 'class-validator';

export class FindBookmarksDto {
  @IsNumber()
  public offset?: number;

  @IsNumber()
  public limit?: number;

  @IsString()
  public sort?: 'DATE_ASC' | 'DATE_DESC' | 'PRICE_ASC' | 'PRICE_DESC';
}
