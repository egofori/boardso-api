import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsNumber()
  public planId: number;

  @IsNotEmpty()
  @IsNumber()
  public ownerId: number;

  @IsNotEmpty()
  @IsNumber()
  public transactionId: number;

  @IsNotEmpty()
  @IsDate()
  public expiresAt: Date;

  @IsNotEmpty()
  @IsDate()
  public subscribedAt: Date;
}
