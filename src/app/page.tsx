import { redirect } from 'next/navigation';
import { getUserProjects } from '@/lib/actions';

// Force dynamic rendering to avoid build-time database calls
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Check if user has any projects
  const projects = await getUserProjects();
  
  if (projects.length > 0) {
    // Redirect to most recent project
    redirect(`/project/${projects[0].id}/research`);
  }
  
  // No projects, go to onboarding
  redirect('/onboarding');
}
