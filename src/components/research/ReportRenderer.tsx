'use client';

import { useState } from 'react';
import type { ResearchReportContent, Source } from '@/lib/services/research/types';

interface ReportRendererProps {
  content: ResearchReportContent;
  sources: Source[];
}

export function ReportRenderer({ content, sources }: ReportRendererProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    exec: true,
    icp: true,
    market: true,
    competitors: true,
    opps: true,
  });

  const toggle = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <button 
          onClick={() => toggle('exec')}
          className="w-full flex items-center justify-between p-4 bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white">Executive Summary</h3>
          <span className={`transform transition-transform ${openSections['exec'] ? 'rotate-180' : ''}`}>▼</span>
        </button>
        
        {openSections['exec'] && (
          <div className="p-6 space-y-4">
            <ul className="space-y-3">
              {content?.executiveSummary?.map((item, i) => (
                <li key={i} className="flex gap-3 text-gray-300">
                  <span className="text-purple-400 mt-1.5">•</span>
                  <span>{item}</span>
                </li>
              )) || <p className="text-gray-500 italic">No executive summary available.</p>}
            </ul>
          </div>
        )}
      </div>

      {/* ICP */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <button onClick={() => toggle('icp')} className="w-full flex items-center justify-between p-4 bg-gray-800/80 hover:bg-gray-700/80 transition-colors">
          <h3 className="text-lg font-semibold text-white">Ideal Customer Profile (ICP)</h3>
          <span className={`transform transition-transform ${openSections['icp'] ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {openSections['icp'] && (
          <div className="p-6 grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-purple-400 mb-3 uppercase tracking-wider">Demographics</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                {content?.icp?.demographics?.map((item, i) => <li key={i}>• {item}</li>) || <li>N/A</li>}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-400 mb-3 uppercase tracking-wider">Psychographics</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                {content?.icp?.psychographics?.map((item, i) => <li key={i}>• {item}</li>) || <li>N/A</li>}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-400 mb-3 uppercase tracking-wider">Pain Points</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                {content?.icp?.painPoints?.map((item, i) => <li key={i}>• {item}</li>) || <li>N/A</li>}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Market Analysis */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <button onClick={() => toggle('market')} className="w-full flex items-center justify-between p-4 bg-gray-800/80 hover:bg-gray-700/80 transition-colors">
          <h3 className="text-lg font-semibold text-white">Market Analysis</h3>
          <span className={`transform transition-transform ${openSections['market'] ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {openSections['market'] && (
          <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase mb-1">TAM</div>
              <div className="font-bold text-white text-lg">{content?.marketAnalysis?.tam || 'N/A'}</div>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase mb-1">SAM</div>
              <div className="font-bold text-white text-lg">{content?.marketAnalysis?.sam || 'N/A'}</div>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase mb-1">SOM</div>
              <div className="font-bold text-white text-lg">{content?.marketAnalysis?.som || 'N/A'}</div>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase mb-1">Growth Rate</div>
              <div className="font-bold text-green-400 text-lg">{content?.marketAnalysis?.growthRate || 'N/A'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Competitors */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <button onClick={() => toggle('competitors')} className="w-full flex items-center justify-between p-4 bg-gray-800/80 hover:bg-gray-700/80 transition-colors">
          <h3 className="text-lg font-semibold text-white">Competitors</h3>
          <span className={`transform transition-transform ${openSections['competitors'] ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {openSections['competitors'] && (
          <div className="p-6 grid gap-6">
            {content?.competitors?.map((comp, i) => (
              <div key={i} className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-white">{comp.name}</h4>
                  {comp.pricing && <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">{comp.pricing}</span>}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-green-500 uppercase font-bold">Strengths</span>
                    <ul className="mt-1 text-sm text-gray-400 list-disc list-inside">
                      {comp.strengths?.map((s, j) => <li key={j}>{s}</li>) || <li>N/A</li>}
                    </ul>
                  </div>
                  <div>
                    <span className="text-xs text-red-500 uppercase font-bold">Weaknesses</span>
                    <ul className="mt-1 text-sm text-gray-400 list-disc list-inside">
                      {comp.weaknesses?.map((w, j) => <li key={j}>{w}</li>) || <li>N/A</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )) || <p className="text-gray-500 italic">No competitors data available.</p>}
          </div>
        )}
      </div>

      {/* Sources */}
      <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-800">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Data Sources & Citations</h4>
        <div className="space-y-2">
          {sources?.map((source, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-400 hover:text-gray-300">
              <span className="text-purple-500 select-none">[{i + 1}]</span>
              <a href={source.url?.startsWith('http') ? source.url : '#'} target="_blank" rel="noreferrer" 
                 className={source.url?.startsWith('http') ? 'underline decoration-gray-700 underline-offset-2' : ''}>
                {source.title || 'Untitled Source'}
              </a>
            </div>
          )) || <p className="text-gray-500 italic">No sources cited.</p>}
        </div>
      </div>
    </div>
  );
}
