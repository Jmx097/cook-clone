'use client';

import { useState } from 'react';
import { useTemplate } from '../../actions/templates';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  name: string;
  description: string | null;
  tags: string | null;
  createdAt: string | Date;
}

export default function TemplateGallery({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [usingId, setUsingId] = useState<string | null>(null);
  const [projectIdea, setProjectIdea] = useState('');

  const handleUse = async (t: Template) => {
    setUsingId(t.id);
  };

  const handleConfirmUse = async (templateId: string) => {
    if (!projectIdea.trim()) return;
    try {
      const res = await useTemplate(templateId, projectIdea);
      if (res.success) {
        router.push(`/project/${res.projectId}/offer`);
      } else {
        alert('Failed: ' + res.error);
        setUsingId(null);
      }
    } catch (e) {
      alert('Error using template');
      setUsingId(null);
    }
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No templates yet</h3>
        <p className="mt-1 text-sm text-gray-500">Approving an Offer + Asset Bundle allows you to save it as a template here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <div key={template.id} className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between space-x-3">
              <h3 className="truncate text-sm font-medium text-gray-900">{template.name}</h3>
              {template.tags && (
                <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {template.tags.split(',')[0]}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500 line-clamp-3">{template.description || 'No description'}</p>
            <div className="mt-4">
               {usingId === template.id ? (
                 <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Project Name / Idea..." 
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                      value={projectIdea}
                      onChange={e => setProjectIdea(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConfirmUse(template.id)}
                        className="flex-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => setUsingId(null)}
                        className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                 </div>
               ) : (
                  <button
                    onClick={() => handleUse(template)}
                    className="w-full inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Use Template
                  </button>
               )}
            </div>
          </div>
          <div className="px-6 py-2">
             <span className="text-xs text-gray-400">Created {new Date(template.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
