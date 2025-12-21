import Link from 'next/link';
import { listAllProjects } from '@/lib/actions';

export async function ProjectSelector({ currentProjectId }: { currentProjectId: string }) {
  const projects = await listAllProjects();
  
  if (projects.length <= 1) {
    return null; // Don't show selector if only one project
  }
  
  return (
    <div className="mb-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-3">Switch Project</div>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/project/${project.id}/research`}
            className={`block px-3 py-2 rounded-lg text-sm truncate transition-all duration-200 ${
              project.id === currentProjectId
                ? 'bg-purple-600/20 text-white border border-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title={project.idea}
          >
            {project.idea.substring(0, 35)}{project.idea.length > 35 ? '...' : ''}
          </Link>
        ))}
      </div>
    </div>
  );
}
