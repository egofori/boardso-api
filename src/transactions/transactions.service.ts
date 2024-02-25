import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaystackService } from '@/paystack/paystack.service';
import { SubscriptionsService } from '@/subscriptions/subscriptions.service';
import { InitializeTransactionWithPlanDto } from './dto/initialize-transaction-with-plan.dto';
import * as dayjs from 'dayjs';
import { verifyTransactionDto } from './dto/verify-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private paystackService: PaystackService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  paymentServiceProvider = 'PAYSTACK';

  async initializeTransactionWithPlan({
    userId,
    planId,
  }: InitializeTransactionWithPlanDto) {
    try {
      const currentTransaction = await this.prisma.transaction.findFirst({
        where: {
          ownerId: +userId,
          status: {
            in: ['PENDING', 'SUCCESS'],
          },
        },
        orderBy: { updateAt: 'desc' },
      });

      const { firstName, lastName, email, phone } =
        await this.prisma.user.findUnique({ where: { id: +userId } });

      const { amount } = await this.prisma.plan.findUnique({
        where: { id: planId },
      });

      if (amount <= 0) {
        throw new BadRequestException('Invalid amount');
      }

      // check the latest transaction
      if (currentTransaction) {
        if (currentTransaction.status === 'SUCCESS') {
          const subscription = await this.prisma.subscription.findUnique({
            where: { transactionId: currentTransaction.id },
          });

          const isSubscriptionActive = subscription
            ? dayjs(subscription.expiresAt).isAfter(dayjs())
            : false;

          // check if transaction is still active
          if (isSubscriptionActive) {
            throw new BadRequestException(
              'An active subscription already exists for this user',
            );
          }
        } else {
          // if a transaction is still pending, verify it to know the status
          const verificationResponse = await this.verifyTransaction({
            userId,
            reference: currentTransaction.reference,
          });

          if (verificationResponse) {
            // if the transaction hasn't failed return the verification response
            if (verificationResponse?.status !== 'failed') {
              return verificationResponse;
            }
          } else {
            throw new BadRequestException(
              'An unknown error occurred. Please try again.',
            );
          }
        }
      }

      // else initialize the transaction
      return this.paystackService
        .initializeTransaction({ email, amount })
        .then(async (response) => {
          if (response.status === true) {
            await this.prisma.transaction.create({
              data: {
                firstName,
                lastName,
                provider: this.paymentServiceProvider,
                email,
                reference: response.data.reference,
                phone,
                status: 'PENDING',
                planId: planId,
                ownerId: +userId,
                metadata: response.data,
              },
            });

            return {
              authorizationURL: response.data.authorization_url,
            };
          }

          throw new BadRequestException(response?.message);
        })
        .catch(() => {
          throw new BadRequestException();
        });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async verifyTransaction({ userId, reference }: verifyTransactionDto) {
    try {
      const {
        id: transactionId,
        ownerId,
        planId,
        plan,
        subscription,
        metadata,
      } = await this.prisma.transaction.findUnique({
        where: { reference, ownerId: +userId },
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
      if (subscription) {
        const transactionMetadata: any = metadata;
        return {
          status: transactionMetadata.status,
          message: transactionMetadata.gateway_response,
        };
      }

      return this.paystackService
        .verifyTransaction(reference)
        .then(async (response) => {
          try {
            const responseData = response.data;

            if (
              responseData.status === 'success' &&
              responseData.amount === plan.amount
            ) {
              await this.prisma.transaction.update({
                where: { id: transactionId },
                data: {
                  status: 'SUCCESS',
                  paidAt: new Date(responseData.paid_at),
                  metadata: responseData,
                },
              });
              await this.subscriptionsService.create({
                subscribedAt: new Date(responseData.paid_at),
                expiresAt: dayjs(responseData.paid_at)
                  .add(plan.number, plan.period as dayjs.ManipulateType)
                  .toDate(),
                transactionId: transactionId,
                ownerId,
                planId,
              });
              await this.prisma.user.update({
                where: {
                  id: +userId,
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

            return {
              status: responseData.status,
              message: responseData.gateway_response,
            };
          } catch {
            throw new BadRequestException();
          }
        })
        .catch(() => {
          throw new BadRequestException();
        });
    } catch {
      throw new BadRequestException();
    }
  }

  async findAll(userId: string) {
    return await this.prisma.transaction
      .findMany({
        where: { ownerId: +userId },
        select: {
          id: true,
          paidAt: true,
          reference: true,
          status: true,
          subscription: {
            select: {
              expiresAt: true,
            },
          },
          plan: {
            select: {
              amount: true,
              id: true,
              name: true,
              currency: true,
              description: true,
              period: true,
              number: true,
              discount: {
                select: {
                  amount: true,
                  unit: true,
                  startDate: true,
                  endDate: true,
                },
              },
            },
          },
        },
        orderBy: {
          updateAt: 'desc',
        },
      })
      .then((response) => response)
      .catch((error) => {
        throw new BadRequestException(error);
      });
  }
}
