import { prisma } from "@/lib/db";
import crypto from 'crypto';

/**
 * Analytics Service
 * Handles privacy-preserving tracking of views and conversions.
 * strictly adheres to Directive 120 (No raw IPs, 90-day retention).
 */

const SALT = process.env.ANALYTICS_SALT || "local-dev-salt"; 

export class AnalyticsService {
  
  /**
   * Generates a daily-rotated hash from IP.
   * Format: SHA256(IP + SALT + YYYY-MM-DD)
   * This prevents long-term tracking of specific IPs.
   */
  static getIpHash(ip: string): string {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const input = `${ip}-${SALT}-${today}`;
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  static async recordView(params: {
    projectId: string;
    variantId?: string | null;
    slug: string;
    ip?: string;
    sessionKey?: string | null;
    userAgent?: string;
    referrer?: string | null;
    utm?: any; 
  }) {
    const ipHash = params.ip ? this.getIpHash(params.ip) : null;
    const userAgentHash = params.userAgent 
      ? crypto.createHash('sha256').update(params.userAgent).digest('hex') 
      : null;

    // Use variantId if provided, otherwise might need lookup (usually provided by caller)
    
    return prisma.pageViewEvent.create({
      data: {
        projectId: params.projectId,
        landingPageVariantId: params.variantId,
        slug: params.slug,
        referrer: params.referrer,
        utmJson: params.utm ? params.utm : undefined,
        sessionKey: params.sessionKey,
        ipHash,
        userAgentHash,
      }
    });
  }

  static async recordConversion(params: {
    projectId: string;
    variantId?: string | null;
    leadId: string;
    ip?: string;
    sessionKey?: string | null;
    utm?: any;
    revenue?: number;
  }) {
    const ipHash = params.ip ? this.getIpHash(params.ip) : null;

    // Trigger pruning chance (1% probability) to avoid dedicated cron
    if (Math.random() < 0.01) {
      this.pruneOldEvents().catch(console.error);
    }

    return prisma.conversionEvent.create({
      data: {
        projectId: params.projectId,
        landingPageVariantId: params.variantId,
        leadId: params.leadId,
        revenue: params.revenue || 0,
        utmJson: params.utm ? params.utm : undefined,
        sessionKey: params.sessionKey,
        ipHash,
      }
    });
  }

  static async pruneOldEvents() {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    await prisma.pageViewEvent.deleteMany({
      where: { createdAt: { lt: ninetyDaysAgo } }
    });
    
    await prisma.conversionEvent.deleteMany({
      where: { createdAt: { lt: ninetyDaysAgo } }
    });
  }

  static async getStats(projectId: string, days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Aggregate Views
    const views = await prisma.pageViewEvent.groupBy({
      by: ['landingPageVariantId'],
      where: { 
        projectId, 
        createdAt: { gte: startDate }
      },
      _count: { _all: true }
    });

    // Aggregate Conversions
    const conversions = await prisma.conversionEvent.groupBy({
      by: ['landingPageVariantId'],
      where: { 
        projectId, 
        createdAt: { gte: startDate }
      },
      _count: { _all: true }
    });
    
    // Map to simple structure
    const stats: Record<string, { views: number, conversions: number, id: string | null }> = {};
    
    views.forEach(v => {
      const vid = v.landingPageVariantId || 'unknown';
      if (!stats[vid]) stats[vid] = { views: 0, conversions: 0, id: v.landingPageVariantId };
      stats[vid].views = v._count._all;
    });

    conversions.forEach(c => {
      const vid = c.landingPageVariantId || 'unknown';
      if (!stats[vid]) stats[vid] = { views: 0, conversions: 0, id: c.landingPageVariantId };
      stats[vid].conversions = c._count._all;
    });

    return Object.values(stats);
  }

  static async getDailyStats(projectId: string, days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // SQLite doesn't support easy date truncation in Prisma.
    // We fetch raw and aggregate in JS for simplicity in local-first Mission 14.
    // Optimization: Raw SQL query would be better, but Prisma Typed SQL is easier to maintain.
    // For now, fetching all events in range is acceptable for "local business" scale.
    
    const views = await prisma.pageViewEvent.findMany({
      where: { projectId, createdAt: { gte: startDate } },
      select: { createdAt: true, landingPageVariantId: true }
    });
    
    const conversions = await prisma.conversionEvent.findMany({
      where: { projectId, createdAt: { gte: startDate } },
      select: { createdAt: true, landingPageVariantId: true }
    });

    const daily: Record<string, { date: string, views: number, conversions: number }> = {};
    
    // Initialize dates
    for (let i = 0; i < days; i++) {
       const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
       daily[d] = { date: d, views: 0, conversions: 0 };
    }

    views.forEach(v => {
      const d = v.createdAt.toISOString().split('T')[0];
      if (daily[d]) daily[d].views++;
    });

    conversions.forEach(c => {
      const d = c.createdAt.toISOString().split('T')[0];
      if (daily[d]) daily[d].conversions++;
    });

    return Object.values(daily).sort((a, b) => a.date.localeCompare(b.date));
  }

  // Helper to parse UTM from URLSearchParams or object
  static parseUtm(query: Record<string, string | string[] | undefined>) {
    const utms = {
      source: query.utm_source,
      medium: query.utm_medium,
      campaign: query.utm_campaign,
      term: query.utm_term,
      content: query.utm_content,
    };
    // remove undefined keys
    return Object.fromEntries(Object.entries(utms).filter(([_, v]) => v != null));
  }
}
