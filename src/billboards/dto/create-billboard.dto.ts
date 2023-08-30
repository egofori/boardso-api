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

  @IsNotEmpty()
  @IsNumber()
  @IsNumberString()
  public price: number;

  @IsNotEmpty()
  @IsString()
  public currency: string;

  @IsNotEmpty()
  @IsString()
  public rate: Rate;

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
