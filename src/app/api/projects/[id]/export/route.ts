import { NextRequest, NextResponse } from "next/server";
import { createExportJob } from "@/lib/exports/job-manager";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // Correct type for Next.js 15+ dynamic routes
) {
  const { id } = await params;
  
  try {
    const body = await req.json();
    const { type } = body;

    if (!['PDF', 'BUNDLE'].includes(type)) {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
    }

    const job = await createExportJob(id, type);
    return NextResponse.json(job);
  } catch (error: any) {
    console.error("Export trigger failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const jobs = await prisma.exportJob.findMany({
    where: { projectId: id },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return NextResponse.json(jobs);
}
