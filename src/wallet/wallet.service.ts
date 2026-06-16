import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DefaultArgs } from '@prisma/client/runtime/client';
import { UUID } from 'crypto';
import {
  Prisma,
  PrismaClient,
  ScheduledTransfer,
  Wallet,
} from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import { BANK_ID } from 'src/utils/constants';
import { CreateWallet, SchedulePayment, TransferMoney } from './utils/dto';

type PrismaTransaction = Omit<
  PrismaClient<never, undefined, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$use' | '$extends'
>;

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async createWallet(
    prisma: PrismaTransaction,
    userId: UUID,
    balance?: number,
  ) {
    const newWallet = await prisma.wallet.create({
      data: {
        userId,
        balance,
      },
    });
    return newWallet.id;
  }

  async createWalletWithAmount(userId: UUID, payload?: CreateWallet) {
    const userWallet = await this.prisma.wallet.findFirst({
      where: {
        userId: {
          equals: userId,
        },
      },
    });
    if (userWallet) {
      throw new ConflictException('Wallet already exists');
    }

    await this.prisma.wallet.upsert({
      create: {
        id: BANK_ID,
      },
      where: { id: BANK_ID },
      update: {},
    });

    if (payload?.amount) {
      return await this.prisma.$transaction(async (tx) => {
        const walletId = await this.createWallet(tx, userId, payload.amount);
        await tx.transaction.create({
          data: {
            description: 'Money added from Bank',
            journalEntry: {
              createMany: {
                data: [
                  {
                    walletId,
                    amount: payload.amount!,
                  },
                  {
                    walletId: 'BANK',
                    amount: -payload.amount!,
                  },
                ],
              },
            },
          },
        });
        return walletId;
      });
    } else {
      return await this.createWallet(this.prisma, userId);
    }
  }

  async transferMoney(
    payload: TransferMoney,
    customTransaction?: PrismaTransaction,
  ) {
    const execute = async (tx: PrismaTransaction) => {
      const wallets = await tx.$queryRaw<Wallet[]>`
        SELECT id, balance FROM wallet.Wallet 
        WHERE id in (${payload.fromWalletId}, ${payload.toWalletId}) 
        FOR UPDATE
      `;

      const fromWallet = wallets.find((w) => w.id === payload.fromWalletId);
      if (!fromWallet || fromWallet.balance < payload.amount) {
        throw new BadRequestException('Insufficient funds');
      }

      const transaction = await tx.transaction.create({
        data: {
          description:
            payload.amount > 0
              ? 'Money added to wallet'
              : 'Money removed from wallet',
          journalEntry: {
            createMany: {
              data: [
                {
                  amount: -payload.amount,
                  walletId: payload.fromWalletId,
                },
                {
                  amount: payload.amount,
                  walletId: payload.toWalletId,
                },
              ],
            },
          },
        },
      });
      await Promise.all([
        tx.wallet.update({
          where: { id: payload.fromWalletId },
          data: { balance: { decrement: payload.amount } },
        }),
        tx.wallet.update({
          where: { id: payload.toWalletId },
          data: { balance: { increment: payload.amount } },
        }),
      ]);

      return transaction.id;
    };

    return customTransaction
      ? execute(customTransaction)
      : this.prisma.$transaction(execute);
  }

  async getWalletDetails(walletId: UUID) {
    const wallet = await this.prisma.wallet.findFirstOrThrow({
      where: {
        id: walletId,
      },
    });
    return wallet;
  }

  async getWalletHistory(walletId: UUID) {
    const history = await this.prisma.journal.findMany({
      where: {
        walletId: { equals: walletId },
      },
      include: {
        transaction: true,
      },
      orderBy: {
        transaction: {
          createdAt: 'desc',
        },
      },
    });
    return history;
  }

  async schedulePayment(payload: SchedulePayment) {
    const schedule = await this.prisma.scheduledTransfer.create({
      data: {
        amount: payload.amount,
        fromWalletId: payload.fromWalletId,
        toWalletId: payload.toWalletId,
        scheduledAt: payload.date,
      },
    });

    return schedule.id;
  }

  async cancelScheduledPayment(paymentId: UUID) {
    const scheduled = await this.prisma.scheduledTransfer.update({
      where: {
        id: paymentId,
      },
      data: {
        status: 'cancelled',
      },
    });
    return scheduled.id;
  }

  @Cron('*/5 * * * *')
  async handleScheduledTransfer() {
    console.log('running...');
    const maxRetries = 3;
    const now = new Date();

    const scheduledTransfers = await this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<ScheduledTransfer[]>(Prisma.sql`
        select * from wallet.ScheduledTransfer
        where scheduledAt <= ${now}
        and status in ('failed', 'upcoming')
        and retryCount < ${maxRetries}
        limit 100
        for update skip locked;
      `);

      if (rows.length === 0) return [];

      const ids = rows.map((r) => r.id);
      await tx.scheduledTransfer.updateMany({
        where: { id: { in: ids } },
        data: { status: 'processing' },
      });

      return rows;
    });

    if (scheduledTransfers.length === 0) return;

    for (const transfer of scheduledTransfers) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await this.transferMoney(
            {
              amount: transfer.amount,
              fromWalletId: transfer.fromWalletId as UUID,
              toWalletId: transfer.toWalletId as UUID,
            },
            tx,
          );

          await tx.scheduledTransfer.update({
            where: { id: transfer.id },
            data: { status: 'completed' },
          });
        });
      } catch (err) {
        console.error(err);
        await this.prisma.scheduledTransfer.update({
          where: { id: transfer.id },
          data: {
            status: 'failed',
            retryCount: { increment: 1 },
          },
        });
      }
    }
  }
}
