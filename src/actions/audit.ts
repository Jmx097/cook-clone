'use server';

import { prisma, getDevUser } from '../lib/db';

export type AuditAction = 
  | 'PROJECT_CREATED'
  | 'RESEARCH_GENERATED'
  | 'RESEARCH_APPROVED'
  | 'ASSETS_GENERATED'
  | 'ASSETS_APPROVED'
  | 'OFFER_GENERATED'
  | 'OFFER_APPROVED'
  | 'TEMPLATE_CREATED'
  | 'TEMPLATE_USED'
  | 'VERSION_APPROVED'
  | 'DRAFT_CREATED_FROM_APPROVED';

interface AuditEventParams {
  projectId?: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  meta?: Record<string, any>;
}

export async function logAuditEvent(params: AuditEventParams) {
  try {
    const user = await getDevUser();
    
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        projectId: params.projectId,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        metaJson: params.meta || {},
      },
    });
  } catch (error) {
    // but in a real system we might want a reliable queue.
  }
}

export async function getAuditLogs(projectId: string) {
  try {
    return await prisma.auditLog.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}
