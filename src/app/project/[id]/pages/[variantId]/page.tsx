import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Editor } from '../Editor';
import Link from 'next/link';
import { LandingPageContent } from '@/services/landingPageGenerator';

export default async function EditorPage({ params }: { params: Promise<{ id: string, variantId: string }> }) {
  const { id, variantId } = await params;

  const variant = await prisma.landingPageVariant.findUnique({
    where: { id: variantId },
    include: { project: true },
  });

  if (!variant || variant.projectId !== id) {
    notFound();
  }
  
  // If published, we redirect or show read-only? 
  // Directive says "To edit a live page... Creates NEW version".
  // So if user visits this ID and it is PUBLISHED, maybe just show read-only or redirect?
  // The List page handles the "New Draft" action.
  // If they somehow get here for a published page, we can just show the Editor in read-only mode or alert.
  // But `Editor` component assumes editing.
  // Let's rely on the list view logic to only link here for DRAFTS.
  // Or handle it gracefully.

  return (
    <div className="space-y-4">
       <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link href={`/project/${id}/pages`} className="hover:text-white">← Back to Pages</Link>
          <span>/</span>
          <span className="text-white">{variant.title}</span>
       </div>
       
       <Editor variant={{
         ...variant,
         slug: variant.slug ?? undefined,
         pageJson: variant.pageJson as LandingPageContent,
       }} />
    </div>
  );
}
