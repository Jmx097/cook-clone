import { prisma } from '../db';
import type { ExportJob, ExportType, ExportStatus } from '../../generated/prisma';

export interface CreateExportJobInput {
  projectId: string;
  type: ExportType;
}

// Create a new export job
export async function createExportJob(data: CreateExportJobInput): Promise<ExportJob> {
  return prisma.exportJob.create({
    data: {
      projectId: data.projectId,
      type: data.type,
      status: 'QUEUED',
    },
  });
}

// Get an export job by ID
export async function getExportJob(id: string): Promise<ExportJob | null> {
  return prisma.exportJob.findUnique({
    where: { id },
  });
}

// List export jobs for a project
export async function listExportJobs(projectId: string): Promise<ExportJob[]> {
  return prisma.exportJob.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });
}

// Update export job status
export async function updateExportJobStatus(
  id: string, 
  status: ExportStatus, 
  outputPath?: string,
  error?: string
): Promise<ExportJob> {
  return prisma.exportJob.update({
    where: { id },
    data: { 
      status,
      ...(outputPath && { outputPath }),
      ...(error && { error }),
    },
  });
}

// Get pending export jobs (for processing)
export async function getPendingExportJobs(): Promise<ExportJob[]> {
  return prisma.exportJob.findMany({
    where: { status: 'QUEUED' },
    orderBy: { createdAt: 'asc' },
  });
}
