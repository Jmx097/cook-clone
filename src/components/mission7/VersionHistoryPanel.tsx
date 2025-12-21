'use client';

import { useEffect, useState } from 'react';
import { getVersions } from '../../actions/versioning';

interface VersionHistoryPanelProps {
  entityType: 'ResearchReport' | 'AssetBundle' | 'Offer';
  projectId: string;
}

export default function VersionHistoryPanel({ entityType, projectId }: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVersions(entityType, projectId).then(data => {
      setVersions(data || []);
      setLoading(false);
    });
  }, [entityType, projectId]);

  if (loading) return <div className="text-sm text-gray-500 animate-pulse">Loading history...</div>;
  if (versions.length === 0) return null;

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Version History</h3>
      <div className="space-y-3">
        {versions.map((v) => (
          <div key={v.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg text-sm">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                v.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 
                v.approvedAt ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {v.approvedAt ? 'APPROVED' : v.status}
              </span>
              <span className="font-semibold text-gray-700">Version {v.version}</span>
              <span className="text-gray-500 text-xs">
                {new Date(v.createdAt).toLocaleString()}
              </span>
            </div>
            {/* Future: Add 'Compare' or 'View' button */}
             <div className="text-xs text-gray-400">
                {v.approvedAt ? 'Locked' : 'Editable'}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
