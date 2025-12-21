'use client';

import { useEffect, useState } from 'react';
import { getAuditLogs } from '../../actions/audit';

export default function AuditLogViewer({ projectId }: { projectId: string }) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    getAuditLogs(projectId).then(setLogs);
  }, [projectId]);

  if (logs.length === 0) return <div className="text-sm text-gray-500 italic p-4 text-center">No recent activity.</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Project Activity</h3>
      </div>
      <ul className="divide-y divide-gray-100">
        {logs.map((log) => (
          <li key={log.id} className="px-4 py-3 text-sm hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <span className="font-medium text-gray-800">{formatAction(log.action)}</span>
              <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1 flex gap-2">
              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{log.entityType}</span>
              {log.metaJson && Object.keys(log.metaJson).length > 0 && (
                <span className="truncate max-w-xs">{JSON.stringify(log.metaJson)}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatAction(action: string) {
  return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}
