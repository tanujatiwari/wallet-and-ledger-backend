import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { DefaultArgs } from '@prisma/client/runtime/client';
import { UUID } from 'crypto';
import { PrismaClient } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import { BANK_ID } from 'src/utils/constants';
import { CreateWallet, TransferMoney } from './utils/dto';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async createWallet(
    prisma: Omit<
      PrismaClient<never, undefined, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$use' | '$extends'
    >,
    userId: UUID,
  ) {
    const newWallet = await prisma.wallet.create({
      data: {
        userId,
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
        const walletId = await this.createWallet(tx, userId);
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

  async transferMoney(payload: TransferMoney) {
    return await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT id FROM wallet.Wallet 
        WHERE id = ${payload.fromWalletId} 
        FOR UPDATE
      `;

      const currBalance =
        (
          await tx.journal.aggregate({
            where: {
              walletId: { equals: payload.fromWalletId },
            },
            _sum: {
              amount: true,
            },
          })
        )._sum.amount ?? 0;

      if (currBalance < payload.amount) {
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
      return transaction.id;
    });
  }

  async getWalletBalance(walletId: UUID) {
    const count = await this.prisma.journal.aggregate({
      where: {
        walletId: { equals: walletId },
      },
      _sum: {
        amount: true,
      },
    });
    return count._sum.amount ?? 0;
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
}
