import { prisma } from "@/lib/db";
import { AnalyticsService } from "@/lib/analytics";
import { ABTestingService } from "@/lib/ab_testing";
import { notFound } from "next/navigation";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts"; // We will create this
import Link from "next/link";

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const project = await prisma.project.findUnique({ 
    where: { id },
    include: { landingPageVariants: true }
  });
  
  if (!project) notFound();

  // Fetch Data
  const stats = await AnalyticsService.getStats(id, 30);
  const daily = await AnalyticsService.getDailyStats(id, 30);
  
  // A/B Tests
  const tests = await prisma.aBTest.findMany({
    where: { projectId: id },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate Totals
  const totalViews = stats.reduce((acc, s) => acc + s.views, 0);
  const totalConversions = stats.reduce((acc, s) => acc + s.conversions, 0);
  const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold">Analytics & Optimization</h1>
            <p className="text-gray-500">Last 30 Days • Local Privacy Mode</p>
         </div>
         <Link href={`/project/${id}`} className="px-4 py-2 border rounded hover:bg-gray-50">
            Back to Project
         </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Total Views</h3>
            <p className="text-3xl font-bold mt-2">{totalViews}</p>
         </div>
         <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Total Leads</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">{totalConversions}</p>
         </div>
         <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Conversion Rate</h3>
            <p className="text-3xl font-bold mt-2 text-blue-600">{conversionRate.toFixed(1)}%</p>
         </div>
      </div>

      {/* Charts & Variant Table */}
      <h2 className="text-xl font-bold mt-8">Performance</h2>
      <AnalyticsCharts daily={daily} />

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm mt-6">
         <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
               <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Variant Details</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Views</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Leads</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Conv. Rate</th>
               </tr>
            </thead>
            <tbody className="divide-y">
               {project.landingPageVariants.map(variant => {
                  const s = stats.find(x => x.id === variant.id) || { views: 0, conversions: 0 };
                  const cr = s.views > 0 ? (s.conversions / s.views) * 100 : 0;
                  return (
                     <tr key={variant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                           <div className="font-medium">{variant.slug || "Draft"}</div>
                           <div className="text-xs text-gray-500">Version {variant.version} • {variant.status}</div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">{s.views}</td>
                        <td className="px-6 py-4 text-right font-mono">{s.conversions}</td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-blue-600">
                           {cr.toFixed(1)}%
                        </td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
      </div>

      {/* A/B Tests Layer */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-bold">A/B Experiments</h2>
           {/* Action to create test? usually from existing variants */}
        </div>
        
        {tests.length === 0 ? (
           <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed">
              No experiments run yet. Create a challenger variant to start testing.
           </div>
        ) : (
           <div className="space-y-4">
              {tests.map(test => (
                 <div key={test.id} className="bg-white border rounded-xl p-6 flex justify-between items-center">
                    <div>
                       <div className="font-bold flex items-center gap-2">
                          {test.name}
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                             test.status === 'RUNNING' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {test.status}
                          </span>
                       </div>
                       <div className="text-sm text-gray-500 mt-1">
                          Started: {test.startedAt ? test.startedAt.toLocaleDateString() : 'Draft'} • 
                          Winner: {test.winnerVariantId ? 'Decided' : 'Undecided'}
                       </div>
                    </div>
                    <div>
                        {/* Detail / Action Buttons */}
                        <Link href={`/project/${id}/analytics/test/${test.id}`} className="text-blue-600 hover:underline text-sm font-medium">
                           View Details
                        </Link>
                    </div>
                 </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
}
