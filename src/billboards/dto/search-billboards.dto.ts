import { IsString, IsNumber } from 'class-validator';

export class SearchBillboardsDto {
  @IsNumber()
  public skip?: number;

  @IsNumber()
  public take?: number;

  @IsString()
  public search?: string;

  @IsString()
  public location?: string;

  @IsString()
  public type?: string;

  @IsNumber()
  public minPrice?: number;

  @IsNumber()
  public maxPrice?: number;

  @IsNumber()
  public width?: number;

  @IsNumber()
  public height?: number;

  @IsNumber()
  public offset?: number;

  @IsNumber()
  public limit?: number;

  @IsString()
  public dimensionUnit: string;

  @IsString()
  public currency: string;

  @IsString()
  public username: string;

  @IsString()
  public sort?: 'DATE_ASC' | 'DATE_DESC' | 'PRICE_ASC' | 'PRICE_DESC';
}
