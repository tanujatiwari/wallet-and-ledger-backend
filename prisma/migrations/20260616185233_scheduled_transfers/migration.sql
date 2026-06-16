-- CreateEnum
CREATE TYPE "wallet"."ScheduledStatus" AS ENUM ('completed', 'upcoming', 'cancelled', 'processing', 'failed');

-- DropForeignKey
ALTER TABLE "wallet"."Wallet" DROP CONSTRAINT "Wallet_userId_fkey";

-- AlterTable
ALTER TABLE "wallet"."Wallet" ADD COLUMN     "balance" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "wallet"."ScheduledTransfer" (
    "id" TEXT NOT NULL,
    "fromWalletId" TEXT NOT NULL,
    "toWalletId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "wallet"."ScheduledStatus" NOT NULL DEFAULT 'upcoming',
    "retryCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ScheduledTransfer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "wallet"."Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
