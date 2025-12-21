'use client';

export function AnalyticsCharts({ daily }: { daily: Array<{ date: string, views: number, conversions: number }> }) {
  if (daily.length === 0) return <div className="h-40 flex items-center justify-center text-gray-400">No data available</div>;

  const maxVal = Math.max(...daily.map(d => d.views), 1);

  return (
    <div className="bg-white p-6 border rounded-xl shadow-sm h-64 flex items-end gap-2 overflow-x-auto">
       {daily.map(d => {
          const height = (d.views / maxVal) * 100;
          const convHeight = (d.conversions / maxVal) * 100;
          return (
             <div key={d.date} className="flex-1 min-w-[20px] group relative flex flex-col justify-end h-full hover:bg-gray-50">
                <div className="relative w-full bg-blue-100 rounded-t" style={{ height: `${height}%` }}>
                   {/* Conversion overlay */}
                   <div className="absolute bottom-0 w-full bg-blue-600 rounded-t opacity-80" style={{ height: `${(d.conversions / d.views) * 100}%` }}></div>
                   
                   {/* Tooltip */}
                   <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs p-2 rounded whitespace-nowrap z-10 pointer-events-none">
                      {d.date}<br/>
                      Views: {d.views}<br/>
                      Leads: {d.conversions}
                   </div>
                </div>
             </div>
          );
       })}
    </div>
  );
}
