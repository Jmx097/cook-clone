import { prisma } from '../db';
import type { Project, Prisma } from '../../generated/prisma';

export interface CreateProjectInput {
  idea: string;
  targetMarket: string;
  revenueGoal: string;
  brandVoiceBrief: string;
  userId: string;
}

export interface UpdateProjectInput {
  idea?: string;
  targetMarket?: string;
  revenueGoal?: string;
  brandVoiceBrief?: string;
}

// Create a new project
export async function createProject(data: CreateProjectInput): Promise<Project> {
  return prisma.project.create({
    data: {
      idea: data.idea,
      targetMarket: data.targetMarket,
      revenueGoal: data.revenueGoal,
      brandVoiceBrief: data.brandVoiceBrief,
      userId: data.userId,
    },
  });
}

// Get a project by ID with all relations
export async function getProject(id: string): Promise<Project | null> {
  return prisma.project.findUnique({
    where: { id },
    include: {
      user: true,
      researchReports: {
        orderBy: { version: 'desc' },
        take: 1,
      },
      assetBundles: {
        orderBy: { version: 'desc' },
        take: 1,
      },
      offers: {
        orderBy: { version: 'desc' },
        take: 1,
      },
      exportJobs: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });
}

// Get project with full details
export async function getProjectWithDetails(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      user: true,
      researchReports: { orderBy: { version: 'desc' } },
      assetBundles: { orderBy: { version: 'desc' } },
      offers: { orderBy: { version: 'desc' } },
      exportJobs: { orderBy: { createdAt: 'desc' } },
    },
  });
}

// List all projects for a user
export async function listProjects(userId: string): Promise<Project[]> {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      researchReports: {
        orderBy: { version: 'desc' },
        take: 1,
        select: { status: true },
      },
      assetBundles: {
        orderBy: { version: 'desc' },
        take: 1,
        select: { status: true },
      },
      offers: {
        orderBy: { version: 'desc' },
        take: 1,
        select: { status: true },
      },
    },
  });
}

// Update a project
export async function updateProject(id: string, data: UpdateProjectInput): Promise<Project> {
  return prisma.project.update({
    where: { id },
    data,
  });
}

// Delete a project (cascades to related records)
export async function deleteProject(id: string): Promise<Project> {
  return prisma.project.delete({
    where: { id },
  });
}
