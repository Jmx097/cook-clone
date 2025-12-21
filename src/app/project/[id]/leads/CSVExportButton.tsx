'use client';

export function CSVExportButton({ leads }: { leads: any[] }) {
  
  const handleExport = () => {
    if (!leads || leads.length === 0) return alert('No leads to export.');
    
    // Convert to CSV
    // Headers
    const headers = ['Date', 'Name', 'Email', 'Phone', 'Message', 'Status', 'Referrer', 'Source', 'Medium', 'Campaign'];
    const rows = leads.map(l => [
      new Date(l.createdAt).toISOString(),
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
      l.status,
      `"${(l.referrer || '').replace(/"/g, '""')}"`,
      `"${(l.utmJson?.source || '').replace(/"/g, '""')}"`,
      `"${(l.utmJson?.medium || '').replace(/"/g, '""')}"`,
      `"${(l.utmJson?.campaign || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r: any[]) => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leads_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleExport}
      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700 text-sm font-medium"
    >
      Export CSV
    </button>
  );
}
