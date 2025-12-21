import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  await prisma.cronHeartbeat.upsert({
    where: { key: 'content-runner' },
    update: { lastRunAt: new Date() },
    create: { key: 'content-runner', lastRunAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
