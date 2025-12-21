'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { generateResearch } from '@/lib/actions';
import { EmptyState } from '@/components/EmptyState';
import { ReportRenderer } from '@/components/research/ReportRenderer';
import type { ResearchReport } from '@/generated/prisma';
import type { ResearchReportContent, Source } from '@/lib/services/research/types';

interface ResearchViewProps {
  projectId: string;
  initialReport: ResearchReport | null;
}

export function ResearchView({ projectId, initialReport }: ResearchViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // report is managed by parent page via router.refresh()
  const report = initialReport;

  const handleGenerate = (forceRefresh: boolean) => {
    startTransition(async () => {
      try {
        await generateResearch(projectId, forceRefresh);
        router.refresh();
      } catch (error) {
        console.error('Failed to generate research:', error);
        alert('Failed to generate research. Please try again.');
      }
    });
  };

  if (!report && !isPending) {
    return (
      <EmptyState
        icon={
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        title="No research generated yet"
        description="Generate comprehensive market research including competitor analysis, market size estimation, trend identification, and opportunity mapping."
        actionLabel="Generate Research"
        disabled={false}
        onClick={() => handleGenerate(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded-xl border border-gray-800">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            <span className="text-gray-500 uppercase text-xs font-bold tracking-wider mr-2">Status</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              isPending ? 'bg-yellow-500/10 text-yellow-500' : 
              report?.status === 'FINAL' ? 'bg-green-500/10 text-green-500' : 
              'bg-gray-700 text-gray-300'
            }`}>
              {isPending ? 'GENERATING...' : report?.status || 'NOT STARTED'}
            </span>
          </div>
          {report && (
            <div className="text-sm text-gray-400">
              <span className="text-gray-500 uppercase text-xs font-bold tracking-wider mr-2">Version</span>
              <span>v{report.version}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">
            <button
              onClick={() => handleGenerate(true)}
              disabled={isPending}
              className="text-xs text-gray-500 hover:text-purple-400 disabled:opacity-50"
            >
              Force Refresh
            </button>
          </label>
          <button
            onClick={() => handleGenerate(false)}
            disabled={isPending}
            className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium 
                     rounded-lg shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-blue-500 
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPending ? 'Analyzing Market...' : report ? 'Refresh Analysis' : 'Generate Research'}
          </button>
        </div>
      </div>

      {report?.content && (
        <ReportRenderer 
          content={report.content as unknown as ResearchReportContent} 
          sources={report.sources as unknown as Source[] || []} 
        />
      )}
    </div>
  );
}
