'use client';

import { useState } from 'react';
import { createTemplate } from '../../actions/templates';
import { useRouter } from 'next/navigation';

interface SaveAsTemplateButtonProps {
  sourceOfferId: string;
  sourceAssetBundleId: string;
}

export default function SaveAsTemplateButton({ sourceOfferId, sourceAssetBundleId }: SaveAsTemplateButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await createTemplate({
        name,
        description: desc,
        sourceOfferId,
        sourceAssetBundleId
      });
      if (res.success) {
        alert('Template created successfully!');
        setShowForm(false);
        router.refresh(); // Update lists if needed
      } else {
        alert('Failed: ' + res.error);
      }
    } catch (e) {
      alert('Error creating template');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Save as Template
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Save Project as Template</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Template Name</label>
            <input 
              type="text" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. SaaS B2B Launch"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !name}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Create Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
