import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [WalletController],
  providers: [WalletService, PrismaService],
})
export class WalletModule {}
