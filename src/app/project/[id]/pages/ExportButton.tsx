'use client';

import { exportLandingPageZip } from '@/actions/exportPage';
import { useState } from 'react';

export function ExportButton({ variantId }: { variantId: string }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const result = await exportLandingPageZip(variantId);
      
      if (result.success && result.data) {
        // Convert base64 to blob
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/zip' });
        
        // Trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename || 'export.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Export failed: ' + result.error);
      }
    } catch (e) {
      console.error(e);
      alert('Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={loading}
      className="px-3 py-1.5 rounded text-sm text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-50"
    >
      {loading ? 'Exporting...' : 'Export ZIP'}
    </button>
  );
}
