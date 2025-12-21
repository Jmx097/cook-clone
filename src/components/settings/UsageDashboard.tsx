import { prisma } from '@/lib/db';

export async function UsageDashboard() {
  // Fetch recent runs
  const runs = await prisma.generationRun.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  // Calculate daily stats (UTC)
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  
  const aggregation = await prisma.generationRun.aggregate({
    _sum: {
      costEstimate: true,
      inputTokens: true, 
      outputTokens: true
    },
    where: {
      createdAt: { gte: startOfDay },
      provider: 'openai'
    }
  });

  const dailyCost = aggregation._sum.costEstimate || 0;
  // const dailyTokens = aggregation._sum.totalTokens || 0;
  
  // Default Budget (Hardcoded for now or Env)
  const budgetLimit = process.env.DAILY_BUDGET_USD ? parseFloat(process.env.DAILY_BUDGET_USD) : 5.0;
  const percentUsed = Math.min((dailyCost / budgetLimit) * 100, 100);

  return (
    <div className="space-y-6">
       
       {/* Budget Card */}
       <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
         <h4 className="text-sm font-medium text-slate-700 mb-4">Daily Budget (OpenAI)</h4>
         
         <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-bold text-slate-900">${dailyCost.toFixed(4)}</span>
            <span className="text-sm text-slate-500">Limit: ${budgetLimit.toFixed(2)}</span>
         </div>
         
         <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full ${percentUsed > 90 ? 'bg-red-500' : 'bg-green-500'}`} 
              style={{ width: `${percentUsed}%` }}
            ></div>
         </div>
         <p className="mt-2 text-xs text-slate-400">Resets daily at 00:00 UTC.</p>
       </div>

       {/* Recent Activity */}
       <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h4 className="text-sm font-medium text-slate-700">Recent Generation Runs</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="uppercase tracking-wider border-b-2 border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-500">Time</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">Provider</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">Tokens</th>
                   <th className="px-6 py-3 font-semibold text-slate-500">Cost</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">Latency</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {runs.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">No activity yet.</td>
                    </tr>
                ) : (
                    runs.map((run: any) => (
                    <tr key={run.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-slate-600">{run.createdAt.toLocaleTimeString()}</td>
                        <td className="px-6 py-3 text-slate-600">{run.provider}</td>
                        <td className="px-6 py-3 text-slate-600">
                            {run.inputTokens !== null ? `${run.inputTokens} -> ${run.outputTokens}` : '-'}
                        </td>
                        <td className="px-6 py-3 text-slate-600">
                             {run.costEstimate ? `$${run.costEstimate.toFixed(5)}` : '-'}
                        </td>
                        <td className="px-6 py-3 text-slate-600">{run.latencyMs ? `${run.latencyMs}ms` : '-'}</td>
                        <td className="px-6 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                ${run.status === 'DONE' ? 'bg-green-100 text-green-800' : ''}
                                ${run.status === 'FAILED' ? 'bg-red-100 text-red-800' : ''}
                                ${run.status === 'BLOCKED_BUDGET' ? 'bg-yellow-100 text-yellow-800' : ''}
                            `}>
                            {run.status}
                            </span>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
       </div>
    </div>
  );
}
