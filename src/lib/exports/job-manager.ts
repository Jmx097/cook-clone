import { prisma } from "@/lib/db";
import { generateBusinessPlanPdf } from "./pdf-renderer";
import { generateContentBundle } from "./zip-bundler";
import path from "path";
import fs from "fs";

// Ensure export directory exists at module level or init
const EXPORT_ROOT = path.join(process.cwd(), "data", "exports");

export async function createExportJob(projectId: string, type: 'PDF' | 'BUNDLE') {
  // 1. Create Job Record
  const job = await prisma.exportJob.create({
    data: {
      projectId,
      type,
      status: 'QUEUED',
    }
  });

  // 2. Start Async Process (Fire and Forget)
  // In a robust system, this would be a queue worker. 
  // For local-first, we just run it in the background of the API request.
  runExportJob(job.id).catch(err => {
    console.error(`Export Job ${job.id} failed silently in background:`, err);
  });

  return job;
}

async function runExportJob(jobId: string) {
  // Update to RUNNING
  await prisma.exportJob.update({
    where: { id: jobId },
    data: { status: 'RUNNING' }
  });

  try {
    const job = await prisma.exportJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    const projectId = job.projectId;
    const timestamp = Math.floor(Date.now() / 1000);
    let filename = "";
    
    // Ensure absolute project dir exists
    const projectDir = path.join(EXPORT_ROOT, projectId);
    if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
    }

    if (job.type === 'PDF') {
      filename = `${timestamp}-business-plan.pdf`;
      const fullPath = path.join(projectDir, filename);
      await generateBusinessPlanPdf(projectId, fullPath);
    } else {
      filename = `${timestamp}-bundle.zip`;
      const fullPath = path.join(projectDir, filename);
      await generateContentBundle(projectId, fullPath);
    }

    // Update to DONE
    await prisma.exportJob.update({
      where: { id: jobId },
      data: { 
        status: 'DONE',
        outputPath: filename // Store relative filename or path relative to export root
      }
    });

  } catch (error: any) {
    console.error(`Export Job ${jobId} Failed:`, error);
    await prisma.exportJob.update({
      where: { id: jobId },
      data: { 
        status: 'FAILED',
        error: error.message || 'Unknown error'
      }
    });
  }
}
