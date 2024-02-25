import { Controller, Get, Post, Param, UseGuards, Body } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '@/auth/jwt.guard';
import { GetCurrentUserId } from '@/decorators/get-current-user-id.decorator';
import { InitializeTransactionWithPlanDto } from './dto/initialize-transaction-with-plan.dto';
import { verifyTransactionDto } from './dto/verify-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('initialize-transaction-with-plan')
  initializeTransactionWithPlan(
    @GetCurrentUserId() userId: string,
    @Body() body: any,
  ) {
    return this.transactionsService.initializeTransactionWithPlan({
      userId,
      planId: body.planId,
    } as InitializeTransactionWithPlanDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify-transaction/:reference')
  verifyTransaction(
    @GetCurrentUserId() userId: string,
    @Param('reference') reference: string,
  ) {
    return this.transactionsService.verifyTransaction({
      userId,
      reference,
    } as verifyTransactionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@GetCurrentUserId() userId: string) {
    return this.transactionsService.findAll(userId);
  }
}
