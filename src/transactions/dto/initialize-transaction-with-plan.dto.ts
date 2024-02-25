import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class InitializeTransactionWithPlanDto {
  @IsNotEmpty()
  @IsString()
  public userId: string;

  @IsNotEmpty()
  @IsNumber()
  public planId: number;
}
