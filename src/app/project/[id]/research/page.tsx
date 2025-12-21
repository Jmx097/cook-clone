import { getLatestResearch } from '@/lib/actions';
import { ResearchView } from '@/components/research/ResearchView';
import ApprovalControls from '@/components/mission7/ApprovalControls';
import VersionHistoryPanel from '@/components/mission7/VersionHistoryPanel';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResearchPage({ params }: PageProps) {
  const { id } = await params;
  const research = await getLatestResearch(id);
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Market Research</h1>
        <p className="text-gray-400">AI-powered insights about your target market and competition</p>
      </div>
      
      {research && (
        <div className="mb-6">
          <ApprovalControls 
            entityType="ResearchReport"
            entityId={research.id}
            projectId={id}
            isApproved={!!research.approvedAt}
            version={research.version}
            approvedAt={research.approvedAt}
          />
        </div>
      )}

      <ResearchView projectId={id} initialReport={research} />
      
      <VersionHistoryPanel entityType="ResearchReport" projectId={id} />
    </div>
  );
}
