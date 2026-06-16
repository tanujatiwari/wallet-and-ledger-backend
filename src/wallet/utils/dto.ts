import { IsDateString, IsInt, IsOptional, IsUUID } from 'class-validator';
import type { UUID } from 'crypto';

export class CreateWallet {
  @IsOptional()
  @IsInt()
  amount?: number;
}

export class UpdateWallet {
  @IsInt()
  amount: number;
}

export class TransferMoney {
  @IsUUID()
  fromWalletId: UUID;

  @IsUUID()
  toWalletId: UUID;

  @IsInt()
  amount: number;
}

export class SchedulePayment extends TransferMoney {
  @IsDateString()
  date: string;
}
