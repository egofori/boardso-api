import { IsNotEmpty, IsString } from 'class-validator';

export class verifyTransactionDto {
  @IsNotEmpty()
  @IsString()
  public userId: string;

  @IsNotEmpty()
  @IsString()
  public reference: string;
}
