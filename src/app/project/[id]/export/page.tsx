'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

type ExportJob = {
  id: string;
  type: 'PDF' | 'BUNDLE';
  status: 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED';
  outputPath?: string;
  error?: string;
  createdAt: string;
};

export default function ExportPage() {
  const { id: projectId } = useParams();
  // Safe cast projectId to string
  const pid = Array.isArray(projectId) ? projectId[0] : projectId;

  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(false);

  // Poll for job updates
  const fetchJobs = useCallback(async () => {
    if (!pid) return;
    try {
      const res = await fetch(`/api/projects/${pid}/export`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch {
      console.error("Failed to fetch jobs");
    }
  }, [pid]);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 2000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const triggerExport = async (type: 'PDF' | 'BUNDLE') => {
    if (!pid) return;
    setLoading(true);
    try {
      await fetch(`/api/projects/${pid}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      // Immediate fetch
      await fetchJobs();
    } catch {
      alert("Failed to start export");
    } finally {
      // Delay loading state turn-off slightly or keep it until status changes? 
      // For now just toggle back so user can see it's queued.
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Export Project</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* PDF Card */}
        <div className="border p-6 rounded-xl shadow-sm bg-white hover:shadow-md transition text-black">
          <h2 className="text-xl font-semibold mb-2">Business Plan PDF</h2>
          <p className="text-gray-600 mb-6">
            A professional, formatted PDF report suitable for investors or stakeholders. 
            Includes Executive Summary, Offer Strategy, and key insights.
          </p>
          <button
            onClick={() => triggerExport('PDF')}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Starting...' : 'Generate PDF Report'}
          </button>
        </div>

        {/* ZIP Card */}
        <div className="border p-6 rounded-xl shadow-sm bg-white hover:shadow-md transition text-black">
          <h2 className="text-xl font-semibold mb-2">Content Bundle (ZIP)</h2>
          <p className="text-gray-600 mb-6">
            Full raw data export including all Research, Offers, and Assets in JSON and Markdown formats.
            Perfect for developer handoff.
          </p>
          <button
            onClick={() => triggerExport('BUNDLE')}
            disabled={loading}
            className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Starting...' : 'Generate ZIP Bundle'}
          </button>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-4">Recent Exports</h3>
      <div className="bg-white border rounded-lg overflow-hidden text-black">
        {jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No recent exports.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-medium">{job.type === 'PDF' ? 'Business Plan' : 'Content Bundle'}</td>
                  <td className="p-4 text-gray-600 text-sm">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={job.status} error={job.error} />
                  </td>
                  <td className="p-4 text-right">
                    {job.status === 'DONE' && job.outputPath && (
                      <a 
                        href={`/api/projects/${pid}/export/${job.outputPath}`}
                        target="_blank"
                        className="text-blue-600 hover:underline text-sm font-medium"
                        download
                      >
                        Download
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, error }: { status: string, error?: string }) {
  const styles = {
    QUEUED: "bg-yellow-100 text-yellow-800",
    RUNNING: "bg-blue-100 text-blue-800",
    DONE: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
  };
  
  const label = status === 'FAILED' && error ? `Failed: ${error.substring(0, 20)}...` : status;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100'}`}>
      {label}
    </span>
  );
}
