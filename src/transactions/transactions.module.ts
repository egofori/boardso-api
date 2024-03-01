import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PaystackService } from '@/paystack/paystack.service';
import { SubscriptionsService } from '@/subscriptions/subscriptions.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, PaystackService, SubscriptionsService],
})
export class TransactionsModule {}
