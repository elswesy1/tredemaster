-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "password" TEXT,
    "avatar" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'trader',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "verifyToken" TEXT,
    "verifyTokenExpiry" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "totalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cashBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "investedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profitLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profitLossPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradingAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "portfolioId" TEXT,
    "name" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "equity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "broker" TEXT,
    "platform" TEXT,
    "accountNumber" TEXT,
    "server" TEXT,
    "connectionMethod" TEXT,
    "connectionStatus" TEXT DEFAULT 'disconnected',
    "lastSync" TIMESTAMP(3),
    "autoSync" BOOLEAN NOT NULL DEFAULT false,
    "metaApiTokenId" TEXT,
    "propFirmCompany" TEXT,
    "propFirmPhase" TEXT,
    "challengeType" TEXT,
    "challengeTarget" DOUBLE PRECISION,
    "challengeStart" TIMESTAMP(3),
    "challengeEnd" TIMESTAMP(3),
    "daysRemaining" INTEGER,
    "dailyDrawdownLimit" DOUBLE PRECISION,
    "dailyDrawdownUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxDailyLoss" DOUBLE PRECISION,
    "overallDrawdownLimit" DOUBLE PRECISION,
    "overallDrawdownUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxOverallLoss" DOUBLE PRECISION,
    "profitTarget" DOUBLE PRECISION,
    "currentProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "indexSymbol" TEXT,
    "exchange" TEXT,
    "lotSize" DOUBLE PRECISION,
    "exchangeName" TEXT,
    "stocksList" TEXT,
    "stocksCount" INTEGER,
    "maxDrawdown" DOUBLE PRECISION,
    "currentDrawdown" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "healthStatus" TEXT NOT NULL DEFAULT 'safe',
    "sparklineData" TEXT,

    CONSTRAINT "TradingAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaApiToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaApiToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradingViewWebhook" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT,
    "webhookToken" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradingViewWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySyncLog" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "syncDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "balanceBefore" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "equityBefore" DOUBLE PRECISION NOT NULL,
    "equityAfter" DOUBLE PRECISION NOT NULL,
    "tradesSynced" INTEGER NOT NULL DEFAULT 0,
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailySyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "portfolioId" TEXT,
    "accountId" TEXT,
    "symbol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "exitPrice" DOUBLE PRECISION,
    "quantity" DOUBLE PRECISION NOT NULL,
    "lotSize" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "stopLoss" DOUBLE PRECISION,
    "takeProfit" DOUBLE PRECISION,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "swap" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profitLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profitLossPoints" DOUBLE PRECISION,
    "pipValue" DOUBLE PRECISION,
    "notes" TEXT,
    "strategy" TEXT,
    "entryReason" TEXT,
    "exitReason" TEXT,
    "emotions" TEXT,
    "confidence" INTEGER,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "playbookId" TEXT,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradingPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'daily',
    "goals" TEXT,
    "rules" TEXT,
    "strategies" TEXT,
    "riskRules" TEXT,
    "maxTrades" INTEGER,
    "maxRisk" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "timeframe" TEXT,
    "conditions" TEXT,
    "entryRules" TEXT,
    "exitRules" TEXT,
    "stopLossRules" TEXT,
    "takeProfitRules" TEXT,
    "riskReward" DOUBLE PRECISION,
    "successRate" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accountName" TEXT,
    "accountType" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "riskTolerance" TEXT NOT NULL DEFAULT 'moderate',
    "riskDegree" INTEGER NOT NULL DEFAULT 5,
    "maxDailyLoss" DOUBLE PRECISION,
    "maxWeeklyLoss" DOUBLE PRECISION,
    "maxMonthlyLoss" DOUBLE PRECISION,
    "maxDrawdown" DOUBLE PRECISION,
    "maxPositionSize" DOUBLE PRECISION,
    "maxRiskPerTrade" DOUBLE PRECISION,
    "maxCorrelatedTrades" INTEGER,
    "maxLeverage" DOUBLE PRECISION,
    "stopLossRequired" BOOLEAN NOT NULL DEFAULT false,
    "takeProfitRequired" BOOLEAN NOT NULL DEFAULT false,
    "riskRewardMin" DOUBLE PRECISION,
    "isConfigured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradingJournal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL DEFAULT 'daily',
    "marketAnalysis" TEXT,
    "keyLevels" TEXT,
    "supportLevels" TEXT,
    "resistanceLevels" TEXT,
    "trendDirection" TEXT,
    "expectedVolatility" TEXT,
    "economicEvents" TEXT,
    "tradingPlan" TEXT,
    "strategiesToUse" TEXT,
    "dailyGoal" TEXT,
    "maxTrades" INTEGER DEFAULT 3,
    "riskPlan" TEXT,
    "sessionType" TEXT,
    "sessionStart" TEXT,
    "sessionEnd" TEXT,
    "tradesPlanned" INTEGER DEFAULT 0,
    "tradesExecuted" INTEGER DEFAULT 0,
    "entrySetups" TEXT,
    "priceActionObs" TEXT,
    "executionNotes" TEXT,
    "marketBehavior" TEXT,
    "realTimeObservations" TEXT,
    "totalTrades" INTEGER DEFAULT 0,
    "winningTrades" INTEGER DEFAULT 0,
    "losingTrades" INTEGER DEFAULT 0,
    "totalProfitLoss" DOUBLE PRECISION DEFAULT 0,
    "sessionResult" TEXT,
    "executionQuality" INTEGER DEFAULT 5,
    "planAdherence" INTEGER DEFAULT 5,
    "riskAdherence" INTEGER DEFAULT 5,
    "emotionsBefore" TEXT,
    "emotionsDuring" TEXT,
    "emotionsAfter" TEXT,
    "whatWentWell" TEXT,
    "whatNeedsImprovement" TEXT,
    "lessonsLearned" TEXT,
    "tomorrowPlan" TEXT,
    "title" TEXT,
    "sentiment" TEXT,
    "pointsOfInterest" TEXT,
    "expectedScenario" TEXT,
    "technicalStrategy" TEXT,
    "keyLevelsPre" TEXT,
    "marketCondition" TEXT,
    "entryModels" TEXT,
    "priceAction" TEXT,
    "tradeExecution" TEXT,
    "observations" TEXT,
    "result" TEXT,
    "improvementsPost" TEXT,
    "plannedTrades" TEXT,
    "actualTrades" TEXT,
    "lessons" TEXT,
    "mistakes" TEXT,
    "improvements" TEXT,
    "mood" INTEGER,
    "energy" INTEGER,
    "focus" INTEGER,
    "confidence" INTEGER,
    "notes" TEXT,
    "attachments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradingJournal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session" TEXT NOT NULL DEFAULT 'london',
    "marketOpen" BOOLEAN NOT NULL DEFAULT true,
    "marketCondition" TEXT,
    "volatility" TEXT,
    "volume" TEXT,
    "tradesPlanned" INTEGER NOT NULL DEFAULT 0,
    "tradesTaken" INTEGER NOT NULL DEFAULT 0,
    "tradesWon" INTEGER NOT NULL DEFAULT 0,
    "tradesLost" INTEGER NOT NULL DEFAULT 0,
    "profitLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rulesFollowed" BOOLEAN,
    "emotions" TEXT,
    "mistakes" TEXT,
    "improvements" TEXT,
    "notes" TEXT,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PsychologyLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL DEFAULT 'check-in',
    "tradeId" TEXT,
    "emotion" TEXT,
    "emotionIntensity" INTEGER,
    "trigger" TEXT,
    "reaction" TEXT,
    "outcome" TEXT,
    "copingStrategy" TEXT,
    "lessons" TEXT,
    "recommendations" TEXT,
    "stress" INTEGER,
    "discipline" INTEGER,
    "patience" INTEGER,
    "confidence" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PsychologyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "period" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "findings" TEXT,
    "recommendations" TEXT,
    "improvements" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "score" INTEGER,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usage" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "limit" INTEGER,
    "period" TEXT NOT NULL DEFAULT 'monthly',
    "resetAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategies" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "timeframe" TEXT,
    "entryRules" TEXT,
    "exitRules" TEXT,
    "riskRules" TEXT,
    "setupName" TEXT,
    "rulesChecklist" TEXT,
    "setupScreenshotUrl" TEXT,
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "winningTrades" INTEGER NOT NULL DEFAULT 0,
    "losingTrades" INTEGER NOT NULL DEFAULT 0,
    "profitLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "winRate" DOUBLE PRECISION,
    "avgRRR" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZenState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "duration" INTEGER,
    "moodBefore" INTEGER,
    "moodAfter" INTEGER,
    "stressBefore" INTEGER,
    "stressAfter" INTEGER,
    "focusBefore" INTEGER,
    "focusAfter" INTEGER,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZenState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradingRule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'entry',
    "compliance" INTEGER NOT NULL DEFAULT 100,
    "violations" INTEGER NOT NULL DEFAULT 0,
    "violationCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "riskProfileId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dailyLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dailyTrades" INTEGER NOT NULL DEFAULT 0,
    "dailyRiskUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weeklyLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weeklyTrades" INTEGER NOT NULL DEFAULT 0,
    "weeklyRiskUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyTrades" INTEGER NOT NULL DEFAULT 0,
    "monthlyRiskUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskBySymbol" TEXT,
    "openTrades" INTEGER NOT NULL DEFAULT 0,
    "totalExposure" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marginUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "riskProfileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'warning',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "currentValue" DOUBLE PRECISION,
    "limitValue" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "tradeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskCheck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "riskProfileId" TEXT NOT NULL,
    "tradeId" TEXT,
    "symbol" TEXT NOT NULL,
    "tradeType" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "stopLoss" DOUBLE PRECISION,
    "takeProfit" DOUBLE PRECISION,
    "quantity" DOUBLE PRECISION NOT NULL,
    "lotSize" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "riskAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskRewardRatio" DOUBLE PRECISION,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "violations" TEXT,
    "warnings" TEXT,
    "userDecision" TEXT,
    "modifiedValues" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "auth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "two_factor_auth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "backupCodes" TEXT[],
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "two_factor_auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "successful" BOOLEAN NOT NULL DEFAULT true,
    "method" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "Portfolio_userId_idx" ON "Portfolio"("userId");

-- CreateIndex
CREATE INDEX "TradingAccount_userId_idx" ON "TradingAccount"("userId");

-- CreateIndex
CREATE INDEX "TradingAccount_portfolioId_idx" ON "TradingAccount"("portfolioId");

-- CreateIndex
CREATE INDEX "TradingAccount_accountType_idx" ON "TradingAccount"("accountType");

-- CreateIndex
CREATE INDEX "TradingAccount_connectionStatus_idx" ON "TradingAccount"("connectionStatus");

-- CreateIndex
CREATE UNIQUE INDEX "TradingAccount_userId_platform_name_key" ON "TradingAccount"("userId", "platform", "name");

-- CreateIndex
CREATE INDEX "MetaApiToken_userId_idx" ON "MetaApiToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TradingViewWebhook_webhookToken_key" ON "TradingViewWebhook"("webhookToken");

-- CreateIndex
CREATE INDEX "TradingViewWebhook_userId_idx" ON "TradingViewWebhook"("userId");

-- CreateIndex
CREATE INDEX "TradingViewWebhook_webhookToken_idx" ON "TradingViewWebhook"("webhookToken");

-- CreateIndex
CREATE INDEX "TradingViewWebhook_processed_idx" ON "TradingViewWebhook"("processed");

-- CreateIndex
CREATE INDEX "DailySyncLog_userId_idx" ON "DailySyncLog"("userId");

-- CreateIndex
CREATE INDEX "DailySyncLog_accountId_idx" ON "DailySyncLog"("accountId");

-- CreateIndex
CREATE INDEX "DailySyncLog_syncDate_idx" ON "DailySyncLog"("syncDate");

-- CreateIndex
CREATE INDEX "Trade_userId_idx" ON "Trade"("userId");

-- CreateIndex
CREATE INDEX "Trade_symbol_idx" ON "Trade"("symbol");

-- CreateIndex
CREATE INDEX "Trade_status_idx" ON "Trade"("status");

-- CreateIndex
CREATE INDEX "Trade_openedAt_idx" ON "Trade"("openedAt");

-- CreateIndex
CREATE INDEX "TradingPlan_userId_idx" ON "TradingPlan"("userId");

-- CreateIndex
CREATE INDEX "TradingPlan_type_idx" ON "TradingPlan"("type");

-- CreateIndex
CREATE INDEX "Setup_userId_idx" ON "Setup"("userId");

-- CreateIndex
CREATE INDEX "Setup_category_idx" ON "Setup"("category");

-- CreateIndex
CREATE INDEX "RiskProfile_userId_idx" ON "RiskProfile"("userId");

-- CreateIndex
CREATE INDEX "RiskProfile_accountId_idx" ON "RiskProfile"("accountId");

-- CreateIndex
CREATE INDEX "TradingJournal_userId_idx" ON "TradingJournal"("userId");

-- CreateIndex
CREATE INDEX "TradingJournal_accountId_idx" ON "TradingJournal"("accountId");

-- CreateIndex
CREATE INDEX "TradingJournal_date_idx" ON "TradingJournal"("date");

-- CreateIndex
CREATE INDEX "TradingJournal_type_idx" ON "TradingJournal"("type");

-- CreateIndex
CREATE INDEX "TradingJournal_sessionType_idx" ON "TradingJournal"("sessionType");

-- CreateIndex
CREATE INDEX "SessionReview_userId_idx" ON "SessionReview"("userId");

-- CreateIndex
CREATE INDEX "SessionReview_date_idx" ON "SessionReview"("date");

-- CreateIndex
CREATE INDEX "SessionReview_session_idx" ON "SessionReview"("session");

-- CreateIndex
CREATE INDEX "PsychologyLog_userId_idx" ON "PsychologyLog"("userId");

-- CreateIndex
CREATE INDEX "PsychologyLog_accountId_idx" ON "PsychologyLog"("accountId");

-- CreateIndex
CREATE INDEX "PsychologyLog_date_idx" ON "PsychologyLog"("date");

-- CreateIndex
CREATE INDEX "PsychologyLog_type_idx" ON "PsychologyLog"("type");

-- CreateIndex
CREATE INDEX "Audit_userId_idx" ON "Audit"("userId");

-- CreateIndex
CREATE INDEX "Audit_type_idx" ON "Audit"("type");

-- CreateIndex
CREATE INDEX "Audit_status_idx" ON "Audit"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_plan_idx" ON "Subscription"("plan");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Usage_subscriptionId_idx" ON "Usage"("subscriptionId");

-- CreateIndex
CREATE INDEX "Usage_userId_idx" ON "Usage"("userId");

-- CreateIndex
CREATE INDEX "Usage_type_idx" ON "Usage"("type");

-- CreateIndex
CREATE INDEX "strategies_userId_idx" ON "strategies"("userId");

-- CreateIndex
CREATE INDEX "strategies_category_idx" ON "strategies"("category");

-- CreateIndex
CREATE INDEX "ZenState_userId_idx" ON "ZenState"("userId");

-- CreateIndex
CREATE INDEX "ZenState_type_idx" ON "ZenState"("type");

-- CreateIndex
CREATE INDEX "TradingRule_userId_idx" ON "TradingRule"("userId");

-- CreateIndex
CREATE INDEX "TradingRule_category_idx" ON "TradingRule"("category");

-- CreateIndex
CREATE INDEX "RiskUsage_userId_idx" ON "RiskUsage"("userId");

-- CreateIndex
CREATE INDEX "RiskUsage_riskProfileId_idx" ON "RiskUsage"("riskProfileId");

-- CreateIndex
CREATE INDEX "RiskUsage_date_idx" ON "RiskUsage"("date");

-- CreateIndex
CREATE INDEX "RiskAlert_userId_idx" ON "RiskAlert"("userId");

-- CreateIndex
CREATE INDEX "RiskAlert_riskProfileId_idx" ON "RiskAlert"("riskProfileId");

-- CreateIndex
CREATE INDEX "RiskAlert_type_idx" ON "RiskAlert"("type");

-- CreateIndex
CREATE INDEX "RiskAlert_isRead_idx" ON "RiskAlert"("isRead");

-- CreateIndex
CREATE INDEX "RiskAlert_createdAt_idx" ON "RiskAlert"("createdAt");

-- CreateIndex
CREATE INDEX "RiskCheck_userId_idx" ON "RiskCheck"("userId");

-- CreateIndex
CREATE INDEX "RiskCheck_riskProfileId_idx" ON "RiskCheck"("riskProfileId");

-- CreateIndex
CREATE INDEX "RiskCheck_passed_idx" ON "RiskCheck"("passed");

-- CreateIndex
CREATE INDEX "RiskCheck_createdAt_idx" ON "RiskCheck"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "auth_accounts_provider_providerAccountId_key" ON "auth_accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "auth_accounts_userId_idx" ON "auth_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_sessionToken_key" ON "auth_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "auth_sessions_userId_idx" ON "auth_sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_auth_userId_key" ON "two_factor_auth"("userId");

-- CreateIndex
CREATE INDEX "login_history_userId_idx" ON "login_history"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingAccount" ADD CONSTRAINT "TradingAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingAccount" ADD CONSTRAINT "TradingAccount_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingAccount" ADD CONSTRAINT "TradingAccount_metaApiTokenId_fkey" FOREIGN KEY ("metaApiTokenId") REFERENCES "MetaApiToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaApiToken" ADD CONSTRAINT "MetaApiToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingViewWebhook" ADD CONSTRAINT "TradingViewWebhook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingViewWebhook" ADD CONSTRAINT "TradingViewWebhook_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TradingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySyncLog" ADD CONSTRAINT "DailySyncLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySyncLog" ADD CONSTRAINT "DailySyncLog_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TradingAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TradingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_playbookId_fkey" FOREIGN KEY ("playbookId") REFERENCES "strategies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingPlan" ADD CONSTRAINT "TradingPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setup" ADD CONSTRAINT "Setup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskProfile" ADD CONSTRAINT "RiskProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskProfile" ADD CONSTRAINT "RiskProfile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TradingAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingJournal" ADD CONSTRAINT "TradingJournal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingJournal" ADD CONSTRAINT "TradingJournal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TradingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionReview" ADD CONSTRAINT "SessionReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsychologyLog" ADD CONSTRAINT "PsychologyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsychologyLog" ADD CONSTRAINT "PsychologyLog_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TradingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZenState" ADD CONSTRAINT "ZenState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingRule" ADD CONSTRAINT "TradingRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskUsage" ADD CONSTRAINT "RiskUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAlert" ADD CONSTRAINT "RiskAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskCheck" ADD CONSTRAINT "RiskCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factor_auth" ADD CONSTRAINT "two_factor_auth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
