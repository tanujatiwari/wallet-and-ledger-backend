import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { UUID } from 'crypto';
import { JwtAuthGuard } from 'src/auth/utils/Guards';
import { BANK_ID } from 'src/utils/constants';
import { User } from 'src/utils/decorators';
import {
  CreateWallet,
  SchedulePayment,
  TransferMoney,
  UpdateWallet,
} from 'src/wallet/utils/dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  async createWallet(@User('id') userId: UUID, @Body() payload?: CreateWallet) {
    return await this.walletService.createWalletWithAmount(userId, payload);
  }

  @Post(':walletId/amount')
  async addOrRemoveMoneyFromWallet(
    @Param('walletId') walletId: UUID,
    @Body() payload: UpdateWallet,
  ) {
    const updatedBalance = await this.walletService.transferMoney({
      amount: payload.amount,
      fromWalletId: walletId,
      toWalletId: BANK_ID,
    });
    return updatedBalance;
  }

  @Get(':walletId')
  async getWalletDetails(@Param('walletId') walletId: UUID) {
    return await this.walletService.getWalletDetails(walletId);
  }

  @Post('transfer')
  async transferMoney(@Body() payload: TransferMoney) {
    const data = await this.walletService.transferMoney(payload);
    return data;
  }

  @Get(':walletId/history')
  async getWalletTransactions(@Param('walletId') walletId: UUID) {
    const data = await this.walletService.getWalletHistory(walletId);
    return data;
  }

  @Post('schedule')
  async schedulePayments(@Body() payload: SchedulePayment) {
    const data = await this.walletService.schedulePayment(payload);
    return data;
  }

  @Patch('schedule/:scheduleId/cancel')
  async cancelScheduledPayment(@Param() scheduleId: UUID) {
    const data = await this.walletService.cancelScheduledPayment(scheduleId);
    return data;
  }
}
