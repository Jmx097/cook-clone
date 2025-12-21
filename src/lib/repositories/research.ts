import { prisma } from '../db';
import type { ResearchReport, ReportStatus } from '../../generated/prisma';

export interface CreateResearchReportInput {
  projectId: string;
  content?: object;
  sources?: object[];
}

// Create a new research report version
export async function createResearchReport(data: CreateResearchReportInput): Promise<ResearchReport> {
  // Get the latest version number
  const latest = await prisma.researchReport.findFirst({
    where: { projectId: data.projectId },
    orderBy: { version: 'desc' },
    select: { version: true },
  });
  
  const nextVersion = (latest?.version ?? 0) + 1;
  
  return prisma.researchReport.create({
    data: {
      projectId: data.projectId,
      version: nextVersion,
      status: 'DRAFT',
      content: data.content,
      sources: data.sources,
    },
  });
}

// Get the latest research report for a project
export async function getLatestResearchReport(projectId: string): Promise<ResearchReport | null> {
  return prisma.researchReport.findFirst({
    where: { projectId },
    orderBy: { version: 'desc' },
  });
}

// Get a specific version
export async function getResearchReportVersion(projectId: string, version: number): Promise<ResearchReport | null> {
  return prisma.researchReport.findUnique({
    where: {
      projectId_version: { projectId, version },
    },
  });
}

// List all versions for a project
export async function listResearchVersions(projectId: string): Promise<ResearchReport[]> {
  return prisma.researchReport.findMany({
    where: { projectId },
    orderBy: { version: 'desc' },
  });
}

// Update report status (e.g., finalize)
export async function updateResearchStatus(id: string, status: ReportStatus): Promise<ResearchReport> {
  return prisma.researchReport.update({
    where: { id },
    data: { status },
  });
}

// Update report content
export async function updateResearchContent(
  id: string, 
  content: object, 
  sources?: object[]
): Promise<ResearchReport> {
  return prisma.researchReport.update({
    where: { id },
    data: { 
      content,
      ...(sources && { sources }),
    },
  });
}
