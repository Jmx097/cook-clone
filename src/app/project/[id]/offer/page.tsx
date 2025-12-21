import { getLatestOffer } from '@/lib/actions';
import { getLatestApproved } from '@/actions/versioning';
import { OfferView } from '@/components/offer/OfferView';
import ApprovalControls from '@/components/mission7/ApprovalControls';
import VersionHistoryPanel from '@/components/mission7/VersionHistoryPanel';
import SaveAsTemplateButton from '@/components/mission7/SaveAsTemplateButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OfferPage({ params }: PageProps) {
  const { id } = await params;
  const offer = await getLatestOffer(id);
  const approvedAssets = await getLatestApproved('AssetBundle', id);
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Offer Builder</h1>
          <p className="text-gray-400">Create your irresistible offer with pricing tiers, guarantees, and upsells</p>
        </div>
        {offer?.approvedAt && approvedAssets && (
             <SaveAsTemplateButton sourceOfferId={offer.id} sourceAssetBundleId={approvedAssets.id} />
        )}
      </div>
      
      {offer && (
        <div className="mb-6">
          <ApprovalControls 
            entityType="Offer" 
            entityId={offer.id} 
            projectId={id}
            isApproved={!!offer.approvedAt}
            version={offer.version}
            approvedAt={offer.approvedAt}
          />
        </div>
      )}

      <OfferView projectId={id} initialOffer={offer} />
      
      <VersionHistoryPanel entityType="Offer" projectId={id} />
    </div>
  );
}
