import { Controller, Post, Req, Res } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { Request, Response } from 'express';

@Controller('paystack')
export class PaystackController {
  constructor(private readonly paystackService: PaystackService) {}

  @Post('webhook')
  webhook(@Req() req: Request, @Res() res: Response) {
    return this.paystackService.webhook(req, res);
  }
}
