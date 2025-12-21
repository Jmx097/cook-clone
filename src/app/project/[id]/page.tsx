
import { getProject } from '@/lib/actions';
import AuditLogViewer from '@/components/mission7/AuditLogViewer';

export default async function ProjectDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) return <div className="p-8 text-white">Project not found</div>;

  return (
    <div className="max-w-5xl mx-auto">
       <div className="mb-8">
         <h1 className="text-3xl font-bold text-white mb-2">{project.idea}</h1>
         <p className="text-gray-400">Project Overview</p>
       </div>

       <div className="grid grid-cols-1 gap-8">
          <div>
             <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
             <AuditLogViewer projectId={id} />
          </div>
       </div>
    </div>
  );
}
