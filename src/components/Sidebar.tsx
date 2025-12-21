'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  projectName: string;
  projectId: string;
}

const links = [
  { name: 'Research', path: 'research', icon: '🔍' },
  { name: 'Assets', path: 'assets', icon: '🎨' },
  { name: 'Offer', path: 'offer', icon: '💰' },
  { name: 'Pages', path: 'pages', icon: '📄' },
  { name: 'Leads', path: 'leads', icon: '📬' },
  { name: 'Export', path: 'export', icon: '📤' },

];

export function Sidebar({ projectName, projectId }: SidebarProps) {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen p-4 hidden lg:block">
      {/* Project Info */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Project</div>
        <div className="text-white font-semibold truncate" title={projectName}>
          {projectName || 'Untitled Project'}
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="space-y-1">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-3">Quick Links</div>
        {links.map((link) => {
          const href = `/project/${projectId}/${link.path}`;
          const isActive = pathname === href;
          
          return (
            <Link
              key={link.path}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
            >
              <span>{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <Link
          href="/projects"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-gray-400 
                     hover:text-white bg-gray-800/50 hover:bg-gray-700 rounded-lg transition-all duration-200
                     border border-gray-700"
        >
          <span>📋</span>
          <span>All Projects</span>
        </Link>
        <Link
          href="/onboarding"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-white
                     bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500
                     rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/25"
        >
          <span>➕</span>
          <span>New Project</span>
        </Link>
      </div>
    </aside>
  );
}
