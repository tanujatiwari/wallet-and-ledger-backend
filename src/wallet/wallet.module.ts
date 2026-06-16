import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [WalletController],
  providers: [WalletService, PrismaService],
})
export class WalletModule {}
