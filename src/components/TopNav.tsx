'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TopNavProps {
  projectId: string;
}

const tabs = [
  { name: 'Research', path: 'research', icon: '🔍' },
  { name: 'Assets', path: 'assets', icon: '🎨' },
  { name: 'Offer', path: 'offer', icon: '💰' },
  { name: 'Export', path: 'export', icon: '📤' },
];

export function TopNav({ projectId }: TopNavProps) {
  const pathname = usePathname();
  
  return (
    <nav className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Business Builder OS
            </span>
          </Link>
          
          {/* Tabs */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const href = `/project/${projectId}/${tab.path}`;
              const isActive = pathname === href;
              
              return (
                <Link
                  key={tab.path}
                  href={href}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/30' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
