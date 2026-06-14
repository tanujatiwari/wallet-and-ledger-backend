-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "wallet";

-- CreateEnum
CREATE TYPE "auth"."UserStatus" AS ENUM ('active', 'archived');

-- CreateEnum
CREATE TYPE "wallet"."KeyStatus" AS ENUM ('processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "wallet"."EventType" AS ENUM ('transferCompleted', 'fundsAdded');

-- CreateEnum
CREATE TYPE "wallet"."EventStatus" AS ENUM ('pending', 'published');

-- CreateTable
CREATE TABLE "auth"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "password" TEXT,
    "status" "auth"."UserStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."Device" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."Session" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."RefreshToken" (
    "refreshToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "rotateAfter" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "previousRefreshTokenId" TEXT,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("refreshToken")
);

-- CreateTable
CREATE TABLE "wallet"."Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet"."Transaction" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet"."Journal" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "Journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet"."IdempotencyKeys" (
    "key" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "status" "wallet"."KeyStatus" NOT NULL DEFAULT 'processing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyKeys_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "wallet"."events" (
    "id" TEXT NOT NULL,
    "type" "wallet"."EventType" NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "wallet"."EventStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "auth"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Device_identifier_key" ON "auth"."Device"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_previousRefreshTokenId_key" ON "auth"."RefreshToken"("previousRefreshTokenId");

-- AddForeignKey
ALTER TABLE "auth"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."Session" ADD CONSTRAINT "Session_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "auth"."Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."RefreshToken" ADD CONSTRAINT "RefreshToken_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "auth"."Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."RefreshToken" ADD CONSTRAINT "RefreshToken_previousRefreshTokenId_fkey" FOREIGN KEY ("previousRefreshTokenId") REFERENCES "auth"."RefreshToken"("refreshToken") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet"."Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet"."Journal" ADD CONSTRAINT "Journal_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "wallet"."Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet"."Journal" ADD CONSTRAINT "Journal_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"."Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
