import { getLatestAssets } from '@/lib/actions';
import { EmptyState } from '@/components/EmptyState';
import ApprovalControls from '@/components/mission7/ApprovalControls';
import VersionHistoryPanel from '@/components/mission7/VersionHistoryPanel';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetsPage({ params }: PageProps) {
  const { id } = await params;
  const assets = await getLatestAssets(id);

  if (!assets) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Brand Assets</h1>
          <p className="text-gray-400">Generated logos, copy, and marketing materials for your brand</p>
        </div>
        
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
           title="No assets generated yet"
          description="Generate professional brand assets including logos, taglines, ad copy, social media content, and email templates that match your brand voice."
          actionLabel="Generate Assets"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Brand Assets</h1>
        <p className="text-gray-400">Generated logos, copy, and marketing materials for your brand</p>
      </div>
      
      <div className="mb-6">
        <ApprovalControls 
          entityType="AssetBundle" 
          entityId={assets.id} 
          projectId={id}
          isApproved={!!assets.approvedAt}
          version={assets.version}
          approvedAt={assets.approvedAt}
        />
      </div>

       <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
         <h3 className="font-semibold mb-2">Asset Bundle Content</h3>
         <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded max-h-96">
            {JSON.stringify(assets, null, 2)}
         </pre>
      </div>
      
      <VersionHistoryPanel entityType="AssetBundle" projectId={id} />
    </div>
  );
}
