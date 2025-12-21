import { prisma } from '@/lib/db';
import { CSVExportButton } from './CSVExportButton';

export default async function LeadsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Simple fetch, no pagination for now per local-first scope simplicity
  const leads = await prisma.lead.findMany({
    where: { projectId: id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold text-white mb-2">Leads Inbox</h1>
            <p className="text-gray-400">View and manage form submissions.</p>
         </div>
         <CSVExportButton leads={leads} />
       </div>

       <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50">
          <table className="w-full text-left text-sm text-gray-400">
             <thead className="bg-gray-800 text-gray-200 uppercase text-xs font-semibold">
                <tr>
                   <th className="px-6 py-4">Date</th>
                   <th className="px-6 py-4">Name</th>
                   <th className="px-6 py-4">Email</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-800">
                {leads.length === 0 ? (
                   <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No leads yet.</td>
                   </tr>
                ) : (
                   leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-800/30 transition-colors">
                         <td className="px-6 py-4">{lead.createdAt.toLocaleDateString()} {lead.createdAt.toLocaleTimeString()}</td>
                         <td className="px-6 py-4 font-medium text-white">{lead.name}</td>
                         <td className="px-6 py-4 text-blue-400">{lead.email}</td>
                         <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 border border-blue-500/20">
                               {lead.status}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button className="text-gray-500 hover:text-white">View</button>
                         </td>
                      </tr>
                   ))
                )}
             </tbody>
          </table>
       </div>
    </div>
  );
}
