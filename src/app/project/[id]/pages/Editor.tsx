'use client';

import { useState } from 'react';
import { updateLandingPageVariant, publishLandingPageVariant } from '@/actions/editorActions';
import Link from 'next/link';

// Simple types for the JSON structure
// We just treat it as `any` or loose shape for editing speed, but ideally strictly typed.
// Since schema is in the service, we replicate simplified interface here or use `any`.

export function Editor({ variant }: { variant: any }) {
  const [pageJson, setPageJson] = useState(variant.pageJson);
  const [isSaving, setIsSaving] = useState(false);
  const [slug, setSlug] = useState(variant.slug || `${variant.project.idea.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${variant.version}`);
  const [activeTab, setActiveTab] = useState<'content' | 'theme' | 'publish'>('content');

  const handleSave = async () => {
    setIsSaving(true);
    await updateLandingPageVariant(variant.id, pageJson);
    setIsSaving(false);
  };

  const handlePublish = async () => {
    if (!slug) return alert('Slug is required');
    if (!confirm('Are you sure you want to publish? This will lock this version.')) return;
    const res = await publishLandingPageVariant(variant.id, slug);
    if (res.success) {
      window.location.reload(); // naive reload to refresh state
    } else {
      alert('Publish failed: ' + res.error);
    }
  };

  // Helper to update a section
  const updateSection = (sectionName: string, data: any) => {
    setPageJson({
      ...pageJson,
      sections: {
        ...pageJson.sections,
        [sectionName]: data,
      },
    });
  };

  const sections = pageJson?.sections || {};

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      {/* Sidebar Controls */}
      <div className="w-1/3 bg-gray-900 rounded-xl border border-gray-800 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button onClick={() => setActiveTab('content')} className={`flex-1 p-3 text-sm font-medium ${activeTab === 'content' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}>Content</button>
          <button onClick={() => setActiveTab('theme')} className={`flex-1 p-3 text-sm font-medium ${activeTab === 'theme' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}>Theme</button>
          <button onClick={() => setActiveTab('publish')} className={`flex-1 p-3 text-sm font-medium ${activeTab === 'publish' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}>Publish</button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {activeTab === 'content' && (
            <>
              {/* Hero */}
              <SectionEditor title="Hero Section" isOpen={true}>
                <Input label="Headline" value={sections.hero?.headline} onChange={(v: string) => updateSection('hero', { ...sections.hero, headline: v })} />
                <Input label="Subheadline" value={sections.hero?.subheadline} onChange={(v: string) => updateSection('hero', { ...sections.hero, subheadline: v })} />
                <Input label="CTA Text" value={sections.hero?.ctaText} onChange={(v: string) => updateSection('hero', { ...sections.hero, ctaText: v })} />
              </SectionEditor>

              {/* Problem */}
              <SectionEditor title="Problem">
                <TextArea label="Paragraphs (one per line)" value={sections.problem?.paragraphs?.join('\n')} onChange={(v: string) => updateSection('problem', { ...sections.problem, paragraphs: v.split('\n') })} />
              </SectionEditor>

              {/* Solution */}
              <SectionEditor title="Solution">
                <TextArea label="Paragraphs" value={sections.solution?.paragraphs?.join('\n')} onChange={(v: string) => updateSection('solution', { ...sections.solution, paragraphs: v.split('\n') })} />
                <TextArea label="Bullets" value={sections.solution?.featureBullets?.join('\n')} onChange={(v: string) => updateSection('solution', { ...sections.solution, featureBullets: v.split('\n') })} />
              </SectionEditor>

              {/* Lead Form */}
              <SectionEditor title="Lead Form">
                <Input label="Headline" value={sections.leadForm?.headline} onChange={(v: string) => updateSection('leadForm', { ...sections.leadForm, headline: v })} />
                <Input label="Subheadline" value={sections.leadForm?.subheadline} onChange={(v: string) => updateSection('leadForm', { ...sections.leadForm, subheadline: v })} />
                <label className="flex items-center gap-2 text-gray-300 text-sm">
                  <input type="checkbox" checked={sections.leadForm?.fieldsEnabled?.phone} onChange={(e) => updateSection('leadForm', { ...sections.leadForm, fieldsEnabled: { ...sections.leadForm.fieldsEnabled, phone: e.target.checked } })} />
                  Include Phone Field
                </label>
                <label className="flex items-center gap-2 text-gray-300 text-sm">
                  <input type="checkbox" checked={sections.leadForm?.fieldsEnabled?.message} onChange={(e) => updateSection('leadForm', { ...sections.leadForm, fieldsEnabled: { ...sections.leadForm.fieldsEnabled, message: e.target.checked } })} />
                  Include Message Field
                </label>
              </SectionEditor>
            </>
          )}

          {activeTab === 'theme' && (
             <div className="text-gray-400 text-sm p-4 text-center">Theme customization is coming soon.</div>
          )}

          {activeTab === 'publish' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Public Slug</label>
                <div className="flex bg-gray-950 border border-gray-700 rounded-lg items-center px-3">
                   <span className="text-gray-500 text-sm">/p/</span>
                   <input 
                      type="text" 
                      value={slug} 
                      onChange={(e) => setSlug(e.target.value)} 
                      className="bg-transparent border-none text-white w-full py-2 focus:ring-0" 
                      placeholder="my-page"
                   />
                </div>
              </div>
              <button 
                 onClick={handlePublish}
                 disabled={isSaving}
                 className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                 Publish Page
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-800 flex gap-2">
           <button onClick={handleSave} disabled={isSaving} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium outline-none">
             {isSaving ? 'Saving...' : 'Save Changes'}
           </button>
        </div>
      </div>

      {/* Preview Pane */}
      <div className="flex-1 bg-white rounded-xl overflow-hidden flex flex-col">
        <div className="bg-gray-100 p-2 border-b border-gray-300 text-xs text-center text-gray-500">
           Preview Mode
        </div>
        <div className="flex-1 overflow-y-auto">
           <PreviewRender pageJson={pageJson} />
        </div>
      </div>
    </div>
  );
}

// Helpers
function SectionEditor({ title, children, isOpen: initialOpen = false }: any) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full px-4 py-3 bg-gray-800/50 flex justify-between items-center hover:bg-gray-800 transition-colors">
        <span className="text-sm font-medium text-gray-200">{title}</span>
        <span className="text-gray-500">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && <div className="p-4 space-y-4 bg-gray-900/30">{children}</div>}
    </div>
  );
}

function Input({ label, value, onChange }: any) {
  return (
    <div className="space-y-1">
       <label className="text-xs text-gray-500 uppercase">{label}</label>
       <input 
          type="text" 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
       />
    </div>
  );
}

function TextArea({ label, value, onChange }: any) {
  return (
    <div className="space-y-1">
       <label className="text-xs text-gray-500 uppercase">{label}</label>
       <textarea 
          rows={4}
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
       />
    </div>
  );
}

function PreviewRender({ pageJson }: { pageJson: any }) {
  const { hero, problem, solution, leadForm, footer } = pageJson?.sections || {};

  return (
    <div className="text-gray-900">
       {/* Hero */}
       <section className="bg-gray-50 py-16 px-4 text-center">
          <div className="max-w-4xl mx-auto">
             <h1 className="text-4xl font-bold mb-4">{hero?.headline}</h1>
             <p className="text-xl text-gray-600 mb-8">{hero?.subheadline}</p>
             <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium">{hero?.ctaText}</button>
          </div>
       </section>
       
       {/* Content */}
       <div className="max-w-3xl mx-auto py-12 px-4 space-y-12">
          {problem && (
             <section>
                <h3 className="text-2xl font-bold mb-4">The Problem</h3>
                {problem.paragraphs?.map((p: string, i: number) => <p key={i} className="mb-2 text-gray-700">{p}</p>)}
             </section>
          )}
          {solution && (
             <section>
                <h3 className="text-2xl font-bold mb-4">The Solution</h3>
                {solution.paragraphs?.map((p: string, i: number) => <p key={i} className="mb-2 text-gray-700">{p}</p>)}
                <ul className="list-disc pl-5 mt-4">
                   {solution.featureBullets?.map((b: string, i: number) => <li key={i} className="mb-1">{b}</li>)}
                </ul>
             </section>
          )}
       </div>

       {/* Form */}
       <section className="bg-gray-100 py-12 px-4">
          <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm text-center">
             <h2 className="text-2xl font-bold mb-2">{leadForm?.headline ?? 'Contact Us'}</h2>
             <p className="text-gray-500 mb-6">{leadForm?.subheadline}</p>
             <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input type="text" placeholder="Name" className="w-full border p-2 rounded" disabled />
                <input type="email" placeholder="Email" className="w-full border p-2 rounded" disabled />
                {leadForm?.fieldsEnabled?.phone && <input type="tel" placeholder="Phone" className="w-full border p-2 rounded" disabled />}
                {leadForm?.fieldsEnabled?.message && <textarea placeholder="Message" className="w-full border p-2 rounded" disabled />}
                <button className="w-full bg-blue-600 text-white py-2 rounded font-medium disabled:opacity-50" disabled>Submit (Preview)</button>
             </form>
          </div>
       </section>

       {/* Footer */}
       <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
          {footer?.disclaimerText}
       </footer>
    </div>
  );
}
