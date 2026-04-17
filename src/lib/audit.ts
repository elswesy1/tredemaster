/**
 * Audit Log System for TradeMaster
 * تسجيل جميع الأنشطة للمستخدمين
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Audit action types
export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  SIGNUP = 'SIGNUP',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  TWO_FA_ENABLED = 'TWO_FA_ENABLED',
  TWO_FA_DISABLED = 'TWO_FA_DISABLED',
  
  // Trading
  TRADE_CREATED = 'TRADE_CREATED',
  TRADE_UPDATED = 'TRADE_UPDATED',
  TRADE_DELETED = 'TRADE_DELETED',
  
  // Portfolio
  PORTFOLIO_CREATED = 'PORTFOLIO_CREATED',
  PORTFOLIO_UPDATED = 'PORTFOLIO_UPDATED',
  PORTFOLIO_DELETED = 'PORTFOLIO_DELETED',
  
  // Risk Management
  RISK_ALERT_CREATED = 'RISK_ALERT_CREATED',
  RISK_ALERT_TRIGGERED = 'RISK_ALERT_TRIGGERED',
  
  // Journal
  JOURNAL_ENTRY_CREATED = 'JOURNAL_ENTRY_CREATED',
  JOURNAL_ENTRY_UPDATED = 'JOURNAL_ENTRY_UPDATED',
  
  // Psychology
  PSYCHOLOGY_ENTRY_CREATED = 'PSYCHOLOGY_ENTRY_CREATED',
  
  // Account
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  ACCOUNT_UPDATED = 'ACCOUNT_UPDATED',
  ACCOUNT_DELETED = 'ACCOUNT_DELETED',
  
  // Playbook
  PLAYBOOK_CREATED = 'PLAYBOOK_CREATED',
  PLAYBOOK_UPDATED = 'PLAYBOOK_UPDATED',
  PLAYBOOK_DELETED = 'PLAYBOOK_DELETED',
  
  // Settings
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
  
  // Security
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  API_KEY_GENERATED = 'API_KEY_GENERATED',
}

interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Get client info from request
function getClientInfo(request: NextRequest) {
  return {
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
}

// Log audit entry
export async function logAudit(
  request: NextRequest,
  entry: Omit<AuditLogEntry, 'ipAddress' | 'userAgent'>
): Promise<void> {
  try {
    const clientInfo = getClientInfo(request);
    
    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        details: entry.details ? JSON.parse(JSON.stringify(entry.details)) : {},
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      },
    });
    
    // Check for suspicious activity
    if (entry.action === AuditAction.LOGIN_FAILED) {
      await checkSuspiciousActivity(entry.userId, clientInfo.ipAddress);
    }
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}

// Check for suspicious activity
async function checkSuspiciousActivity(userId: string, ipAddress: string): Promise<void> {
  const recentFailures = await prisma.auditLog.count({
    where: {
      userId,
      action: AuditAction.LOGIN_FAILED,
      createdAt: {
        gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
      },
    },
  });
  
  if (recentFailures >= 5) {
    // Log suspicious activity
    await prisma.auditLog.create({
      data: {
        userId,
        action: AuditAction.SUSPICIOUS_ACTIVITY,
        details: {
          reason: 'Multiple failed login attempts',
          attempts: recentFailures,
          ipAddress,
        },
        ipAddress,
        userAgent: 'system',
      },
    });
    
    // TODO: Send notification to user
    // TODO: Optionally lock account
  }
}

// Get audit logs for user
export async function getUserAuditLogs(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
  }
) {
  const { limit = 50, offset = 0, action, startDate, endDate } = options || {};
  
  return prisma.auditLog.findMany({
    where: {
      userId,
      ...(action && { action }),
      ...(startDate && endDate && {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    skip: offset,
  });
}

// Get audit logs statistics
export async function getAuditStats(userId: string) {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const [logins24h, logins7d, logins30d, failedLogins24h] = await Promise.all([
    prisma.auditLog.count({
      where: {
        userId,
        action: AuditAction.LOGIN,
        createdAt: { gte: last24Hours },
      },
    }),
    prisma.auditLog.count({
      where: {
        userId,
        action: AuditAction.LOGIN,
        createdAt: { gte: last7Days },
      },
    }),
    prisma.auditLog.count({
      where: {
        userId,
        action: AuditAction.LOGIN,
        createdAt: { gte: last30Days },
      },
    }),
    prisma.auditLog.count({
      where: {
        userId,
        action: AuditAction.LOGIN_FAILED,
        createdAt: { gte: last24Hours },
      },
    }),
  ]);
  
  return {
    logins24h,
    logins7d,
    logins30d,
    failedLogins24h,
  };
}

// Clean old audit logs (run periodically)
export async function cleanOldAuditLogs(daysToKeep: number = 90): Promise<number> {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  
  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });
  
  return result.count;
}
