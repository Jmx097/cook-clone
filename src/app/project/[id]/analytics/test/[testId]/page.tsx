import { prisma } from "@/lib/db";
import { AnalyticsService } from "@/lib/analytics";
import { ABTestingService } from "@/lib/ab_testing";
import { notFound, redirect } from "next/navigation";
import { promoteWinner, stopTest } from "@/actions/abActions"; // createChallenger used elsewhere (e.g. Iteration UI)

export default async function TestDetailPage({ params }: { params: Promise<{ id: string, testId: string }> }) {
  const { id, testId } = await params;

  const test = await prisma.aBTest.findUnique({
    where: { id: testId },
    include: { project: true }
  });

  if (!test || test.projectId !== id) notFound();

  // Check Winner Status
  const { winnerId, stats } = await ABTestingService.checkWinner(testId);
  
  // Logic to handle actions (Server Action Wrappers)
  async function onPromote(formData: FormData) {
     'use server';
     const wid = formData.get('winnerId') as string;
     await promoteWinner(testId, wid);
     redirect(`/project/${id}/analytics`);
  }

  async function onStop() {
     'use server';
     await stopTest(testId);
     redirect(`/project/${id}/analytics`);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
       {/* Header */}
       <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{test.name}</h1>
            <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                 test.status === 'RUNNING' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {test.status}
            </div>
            {test.winnerVariantId && (
               <div className="mt-2 text-blue-600 font-bold">
                 Winner Declared: {test.winnerVariantId === test.controlVariantId ? 'Control' : 'Challenger'}
               </div>
            )}
          </div>
          
          <div className="space-x-4">
             {test.status === 'RUNNING' && (
                <form action={onStop} className="inline">
                   <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
                      Stop Test
                   </button>
                </form>
             )}
          </div>
       </div>

       {/* Winner Suggestion Box */}
       {test.status === 'RUNNING' && winnerId && (
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl flex justify-between items-center text-blue-900">
             <div>
                <h3 className="text-lg font-bold">Winner Found!</h3>
                <p className="text-blue-700/80">
                   Statistical significance has been reached. Variant <span className="font-mono font-bold">{winnerId}</span> is performing best.
                </p>
             </div>
             <form action={onPromote}>
                <input type="hidden" name="winnerId" value={winnerId} />
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow font-bold hover:bg-blue-700">
                   Promote Winner
                </button>
             </form>
          </div>
       )}

       {/* Variants Table */}
       <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
             <thead className="bg-gray-50 border-b">
                <tr>
                   <th className="px-6 py-4 font-semibold text-gray-500 uppercase text-xs">Variant</th>
                   <th className="px-6 py-4 font-semibold text-gray-500 uppercase text-xs">Role</th>
                   <th className="px-6 py-4 font-semibold text-gray-500 uppercase text-xs text-right">Views</th>
                   <th className="px-6 py-4 font-semibold text-gray-500 uppercase text-xs text-right">Leads</th>
                   <th className="px-6 py-4 font-semibold text-gray-500 uppercase text-xs text-right">Conv. Rate</th>
                   <th className="px-6 py-4 font-semibold text-gray-500 uppercase text-xs text-right">Confidence (LB)</th>
                </tr>
             </thead>
             <tbody className="divide-y">
                {/* Control */}
                <VariantRow 
                   id={test.controlVariantId} 
                   role="Control" 
                   stats={stats[test.controlVariantId]} 
                   isWinner={winnerId === test.controlVariantId} 
                />
                {/* Challengers */}
                {(test.challengerVariantIds as string[]).map(vid => (
                   <VariantRow 
                      key={vid} 
                      id={vid} 
                      role="Challenger" 
                      stats={stats[vid]} 
                      isWinner={winnerId === vid} 
                   />
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
}

function VariantRow({ id, role, stats, isWinner }: { id: string, role: string, stats: any, isWinner: boolean }) {
  if (!stats) return null;
  const cr = stats.views > 0 ? (stats.conversions / stats.views) * 100 : 0;
  
  return (
    <tr className={isWinner ? "bg-green-50" : ""}>
       <td className="px-6 py-4 font-mono text-sm">{id.slice(0, 8)}...</td>
       <td className="px-6 py-4">
          <span className={`text-xs px-2 py-1 rounded-full ${role === 'Control' ? 'bg-gray-100' : 'bg-purple-100 text-purple-700'}`}>
             {role}
          </span>
       </td>
       <td className="px-6 py-4 text-right">{stats.views}</td>
       <td className="px-6 py-4 text-right">{stats.conversions}</td>
       <td className="px-6 py-4 text-right font-bold">{cr.toFixed(1)}%</td>
       <td className="px-6 py-4 text-right text-gray-400 text-xs">
          {(stats.lowerBound * 100).toFixed(1)}%
       </td>
    </tr>
  );
}
