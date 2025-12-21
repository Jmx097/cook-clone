
import Link from 'next/link';
import { getTemplates } from '@/actions/templates';
import TemplateGallery from '@/components/mission7/TemplateGallery';

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Global Sidebar (Simplified) */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen p-4 hidden lg:block">
         <div className="mb-6 p-4">
            <Link href="/" className="flex items-center gap-2">
               <span className="text-2xl">🚀</span>
               <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
               CookAI
               </span>
            </Link>
         </div>
         <nav className="space-y-1">
            <Link href="/projects" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800">
               <span>📋</span>
               <span>All Projects</span>
            </Link>
            <Link href="/templates" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-800 text-white">
               <span>🧩</span>
               <span>Templates</span>
            </Link>
         </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Simple Header */}
        <header className="border-b border-gray-200 bg-white px-8 py-4">
           <h1 className="text-xl font-semibold text-gray-800">Template Gallery</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
             <div className="mb-8">
               <h2 className="text-2xl font-bold text-gray-900">Available Templates</h2>
               <p className="mt-2 text-sm text-gray-600">Start new projects faster by using approved templates.</p>
             </div>
             
             <TemplateGallery templates={templates} />
          </div>
        </main>
      </div>
    </div>
  );
}
