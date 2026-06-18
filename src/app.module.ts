import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { redisOptions } from './redis';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [AuthModule, WalletModule, CacheModule.register(redisOptions)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
