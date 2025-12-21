import { notFound } from 'next/navigation';
import { getProject } from '@/lib/actions';
import { TopNav } from '@/components/TopNav';
import { Sidebar } from '@/components/Sidebar';

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { id } = await params;
  const project = await getProject(id);
  
  if (!project) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <TopNav projectId={id} />
      
      <div className="flex">
        <Sidebar 
          projectId={id} 
          projectName={project.idea.substring(0, 50) + (project.idea.length > 50 ? '...' : '')} 
        />
        
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
