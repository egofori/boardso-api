import { Rate } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
} from 'class-validator';

export class CreateBillboardDto {
  @IsNotEmpty()
  @IsString()
  public title: string;

  @IsString()
  public description: string;

  @IsNotEmpty()
  @IsNumber()
  @IsNumberString()
  public width: number;

  @IsNotEmpty()
  @IsNumber()
  @IsNumberString()
  public height: number;

  @IsNumber()
  @IsNumberString()
  public price: number | null;

  @IsString()
  public currency: string | null;

  @IsString()
  public rate: Rate | null;

  @IsNotEmpty()
  @IsString()
  public type: string;

  @IsNotEmpty()
  @IsString()
  public dimensionUnit: string;

  @IsNotEmpty()
  @IsString()
  public location: string;
}
