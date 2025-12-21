import Link from 'next/link';
import { listAllProjects } from '@/lib/actions';

export default async function ProjectsPage() {
  const projects = await listAllProjects();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Projects</h1>
            <p className="text-gray-400">Select a project to continue working on</p>
          </div>
          <Link
            href="/onboarding"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium 
                     rounded-lg shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-blue-500 
                     transition-all duration-200"
          >
            ➕ New Project
          </Link>
        </div>
        
        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-xl">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">Create your first business project to get started</p>
            <Link
              href="/onboarding"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white 
                       font-medium rounded-lg shadow-lg shadow-purple-500/25"
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/project/${project.id}/research`}
                className="block p-6 bg-gray-900/80 backdrop-blur-xl rounded-xl border border-gray-800 
                         hover:border-purple-500/50 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {project.idea.substring(0, 80)}{project.idea.length > 80 ? '...' : ''}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      Target: {project.targetMarket.substring(0, 60)}{project.targetMarket.length > 60 ? '...' : ''}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Goal: {project.revenueGoal}</span>
                      <span>•</span>
                      <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-4 text-gray-500 group-hover:text-purple-400 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
