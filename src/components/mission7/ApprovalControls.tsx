'use client';

import { useState } from 'react';
import { approveVersion, createDraftFromApproved } from '../../actions/versioning';
import { useRouter } from 'next/navigation';

interface ApprovalControlsProps {
  entityType: 'ResearchReport' | 'AssetBundle' | 'Offer';
  entityId: string;
  projectId: string;
  isApproved: boolean;
  version: number;
  approvedAt?: string | Date | null;
}

export default function ApprovalControls({
  entityType,
  entityId,
  projectId,
  isApproved,
  version,
  approvedAt
}: ApprovalControlsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this version? It will become read-only.')) return;
    setLoading(true);
    try {
      const res = await approveVersion(entityType, entityId, projectId, `/project/${projectId}`);
      if (res.success) {
        router.refresh();
      } else {
        alert('Failed: ' + res.error);
      }
    } catch (e) {
      alert('Error approving version');
    } finally {
      setLoading(false);
    }
  };

  const handleNewDraft = async () => {
    if (!confirm('Create a new Draft version from this approved version?')) return;
    setLoading(true);
    try {
      const res = await createDraftFromApproved(entityType, entityId, projectId, `/project/${projectId}`) as any;
      if (res.success) {
        router.refresh();
      } else {
        alert('Failed: ' + res.error);
      }
    } catch (e) {
      alert('Error creating draft');
    } finally {
      setLoading(false);
    }
  };

  if (isApproved) {
    return (
      <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 text-green-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span className="font-semibold">Version {version} Approved</span>
          <span className="text-sm opacity-75">
            {approvedAt ? new Date(approvedAt).toLocaleDateString() : ''}
          </span>
        </div>
        <div className="ml-auto">
          <button
            onClick={handleNewDraft}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'New Draft'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2 text-gray-600">
        <span className="font-semibold">Version {version} (Draft)</span>
      </div>
      <div className="ml-auto">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Approving...' : 'Approve Version'}
        </button>
      </div>
    </div>
  );
}
