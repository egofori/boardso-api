import { Module } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SubscriptionsService } from '@/subscriptions/subscriptions.service';
import { PaystackController } from './paystack.controller';

@Module({
  controllers: [PaystackController],
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('PAYSTACK_BASE_URL'),
        headers: {
          Authorization: `Bearer ${configService.get('PAYSTACK_SECRET_KEY')}`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [PaystackService, SubscriptionsService],
})
export class PaystackModule {}
