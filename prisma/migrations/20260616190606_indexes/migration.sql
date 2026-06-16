-- CreateIndex
CREATE INDEX "RefreshToken_sessionId_idx" ON "auth"."RefreshToken"("sessionId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "auth"."Session"("userId");

-- CreateIndex
CREATE INDEX "Session_deviceId_idx" ON "auth"."Session"("deviceId");

-- CreateIndex
CREATE INDEX "Journal_walletId_transactionId_idx" ON "wallet"."Journal"("walletId", "transactionId");

-- CreateIndex
CREATE INDEX "ScheduledTransfer_status_scheduledAt_retryCount_idx" ON "wallet"."ScheduledTransfer"("status", "scheduledAt", "retryCount");

-- CreateIndex
CREATE INDEX "Wallet_userId_idx" ON "wallet"."Wallet"("userId");
