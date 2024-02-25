import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { Request, Response } from 'express';
import { PrismaService } from '@/prisma/prisma.service';
import { SubscriptionsService } from '@/subscriptions/subscriptions.service';
import * as dayjs from 'dayjs';

@Injectable()
export class PaystackService {
  paystackBaseURL = this.config.get('PAYSTACK_BASE_URL');
  paystackAxios = this.httpService.axiosRef;

  constructor(
    private config: ConfigService,
    private readonly httpService: HttpService,
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
  ) {
    this.paystackAxios.defaults.baseURL = this.config.get('PAYSTACK_BASE_URL');
    this.paystackAxios.defaults.headers.common.Authorization = `Bearer ${this.config.getOrThrow(
      'PAYSTACK_SECRET_KEY',
    )}`;
  }

  async initializeTransaction(data: any) {
    const { data: response } = await firstValueFrom(
      this.httpService.post('/transaction/initialize', data).pipe(
        catchError(() => {
          throw new BadRequestException();
        }),
      ),
    );

    return response;
  }

  async verifyTransaction(reference: string) {
    const { data: response } = await firstValueFrom(
      this.httpService.get(`/transaction/verify/${reference}`).pipe(
        catchError(() => {
          throw new BadRequestException();
        }),
      ),
    );

    return response;
  }

  async webhook(req: Request, res: Response) {
    // validate event is coming from Paystack
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    // TODO: add ip whitelisting.
    if (hash !== req.headers['x-paystack-signature']) {
      return res.sendStatus(400);
    }

    const reference = req.body.data.reference;

    if (req.body.event === 'charge.success') {
      try {
        const {
          id: transactionId,
          ownerId,
          planId,
          plan,
          subscription,
        } = await this.prisma.transaction.findUnique({
          where: { reference },
          select: {
            id: true,
            ownerId: true,
            planId: true,
            plan: true,
            subscription: true,
            metadata: true,
          },
        });

        // if subscription exists transaction has already been verified
        // in that case return the saved transaction details
        if (!subscription) {
          const responseData = req.body.data;

          if (
            responseData.status === 'success' &&
            responseData.amount === plan.amount
          ) {
            // update transaction
            await this.prisma.transaction.update({
              where: { id: transactionId },
              data: {
                status: 'SUCCESS',
                paidAt: new Date(responseData.paid_at),
                metadata: responseData,
              },
            });
            // create subscription since it doesn't exist
            await this.subscriptionsService.create({
              subscribedAt: new Date(responseData.paid_at),
              expiresAt: dayjs(responseData.paid_at)
                .add(plan.number, plan.period as dayjs.ManipulateType)
                .toDate(),
              transactionId: transactionId,
              ownerId,
              planId,
            });
            // add the transaction phone as the user's
            await this.prisma.user.update({
              where: {
                id: ownerId,
              },
              data: {
                phone: responseData.customer.phone,
              },
            });
          } else if (
            responseData.status === 'failed' ||
            responseData.status === 'abandoned'
          ) {
            await this.prisma.transaction.update({
              where: { id: transactionId },
              data: { status: 'FAILED', metadata: responseData },
            });
          } else if (
            responseData.status === 'reversed' &&
            responseData.amount === plan.amount
          ) {
            await this.prisma.transaction.update({
              where: { id: transactionId },
              data: { status: 'REVERSED', metadata: responseData },
            });
          }
        }
      } catch {
        // pass
      }
    }

    res.sendStatus(200);
  }
}
