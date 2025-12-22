import { prisma } from '@/lib/db';


export const dynamic = 'force-dynamic';

// Helper to measure DB latency
async function checkDatabase(): Promise<string> {
  try {
    const start = performance.now();
    await prisma.project.count();
    const duration = Math.round(performance.now() - start);
    return `Connected (${duration}ms)`;
  } catch (e) {
    return `Error: ${(e as Error).message}`;
  }
}

// Helper to format cron status
function formatCronStatus(lastRunAt: Date | null, now: number): string {
  if (!lastRunAt) return 'Never Run';
  const secondsAgo = Math.floor((now - lastRunAt.getTime()) / 1000);
  return `Last Run: ${lastRunAt.toLocaleString()} (${secondsAgo}s ago)`;
}

export default async function PreflightPage() {
  // Capture timestamp once at the start of request
  const requestTime = performance.now();

  // 1. Database Check  
  const dbStatus = await checkDatabase();

  // 2. Blob Check
  const blobStatus = process.env.BLOB_READ_WRITE_TOKEN 
    ? 'Configured (Env Var Present)' 
    : 'Missing BLOB_READ_WRITE_TOKEN';

  // 3. Cron Heartbeat
  const heartbeat = await prisma.cronHeartbeat.findUnique({
    where: { key: 'content-runner' },
  });
  const cronStatus = formatCronStatus(heartbeat?.lastRunAt ?? null, requestTime);

  // 4. Queue (ExportJobs) using groupBy
  // Note: groupBy might be disabled in some accelerate setups but usually fine. 
  // If it fails we'll wrap or use count.
  const queueStats: Record<string, number> = {};
  try {
    const stats = await prisma.exportJob.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    stats.forEach(s => {
      queueStats[s.status] = s._count.status;
    });
  } catch (_e) {
    // Fallback if groupBy fails
    queueStats['Error retrieving stats'] = 0;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-6">System Preflight & Health</h1>
      
      <div className="space-y-6">
        <Section title="Database" status={dbStatus} color={dbStatus.startsWith('Error') ? 'red' : 'green'} />
        
        <Section title="Blob Storage" status={blobStatus} color={blobStatus.startsWith('Missing') ? 'red' : 'green'} />
        
        <Section title="Cron Jobs" status={cronStatus} color={cronStatus === 'Never Run' ? 'yellow' : 'green'} />
        
        <div className="border p-4 rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Queue Status (ExportJobs)</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(queueStats).length === 0 && <div>No jobs found</div>}
            {Object.entries(queueStats).map(([status, count]) => (
              <div key={status} className="flex justify-between">
                <span>{status}</span>
                <span className="font-mono font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, status, color }: { title: string; status: string; color: string }) {
  const colorClass = {
    green: 'text-green-700 bg-green-50 border-green-200',
    red: 'text-red-700 bg-red-50 border-red-200',
    yellow: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  }[color] || 'text-gray-700 bg-gray-50 border-gray-200';

  return (
    <div className={`border p-4 rounded ${colorClass}`}>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1">{status}</p>
    </div>
  );
}
