'use server';

import { prisma } from '@/lib/db';
import { ABTestingService } from '@/lib/ab_testing';
import { revalidatePath } from 'next/cache';

export async function promoteWinner(testId: string, winnerId: string) {
  // 1. Mark test as finished
  await ABTestingService.promoteWinner(testId, winnerId);

  // 2. Logic to "Publish" the winner if not already active?
  // If we rely on /p/[slug] and A/B router, the router logic checks for 'FINISHED' test?
  // Wait, if test is finished, how does Router know which one to serve?
  
  // Directive says: "Promote winner... clones winner pageJson to new DRAFT...". 
  // Wait, that's "Create Challenger".
  // "Promote Winner" implies making the winner the PERMANENT page.
  
  // If we operate via Slug:
  // The 'Entry Variant' (Control) owns the Slug.
  // If Challenger Wins, we should probably:
  // Option A: Update the Control Variant's content with Challenger's Content.
  // Option B: Swap Slugs? (Dangerous).
  // Option C: The Router Page respects FINISHED tests winner?
  
  // Let's go with Option C for now implicitly, BUT strict local-first standard implies simpler state.
  // Ideally, "Promote Winner" means:
  // 1. Iterate: Copy Winner Content -> New Standard Draft.
  // 2. Publish: User manually publishes it?
  
  // The User Request says: 
  // "Promote winner... + iteration loop (create new challenger...)"
  // "Promote Winner" button in Dashboard.
  
  // Let's just mark the test as WON.
  // And maybe update the Project's "Main" pointer?
  // Current logic in `PublicPage`:
  //    Check active test (RUNNING).
  //    If no running test, it serves `entryVariant`.
  
  // So if we promote a challenger, `PublicPage` will revert to `entryVariant` (Control) because test is FINISHED!
  // This is BAD. The loser would be live.
  
  // Fix: "Promote Winner" must SWAP content? 
  // OR `PublicPage` should check for "Last Won Test"?.
  
  // Better: "Promote Winner" -> Archiving the old Control, and switching the Challenger to be the new Control (active slug owner).
  // 1. Set Control.slug = null, Control.status = ARCHIVED.
  // 2. Set Winner.slug = [Original Slug], Winner.status = PUBLISHED.
  
  const test = await prisma.aBTest.findUnique({ where: { id: testId } });
  if (!test) throw new Error("Test not found");
  
  // If winner is the control, nothing to do (content wise).
  if (winnerId !== test.controlVariantId) {
     // Swap Slug
     const control = await prisma.landingPageVariant.findUnique({ where: { id: test.controlVariantId } });
     const winner = await prisma.landingPageVariant.findUnique({ where: { id: winnerId } });
     
     if (control && winner && control.slug) {
         // Transaction to swap
         await prisma.$transaction([
             prisma.landingPageVariant.update({
                 where: { id: control.id },
                 data: { slug: null, status: 'ARCHIVED' }
             }),
             prisma.landingPageVariant.update({
                 where: { id: winner.id },
                 data: { slug: control.slug, status: 'PUBLISHED' }
             })
         ]);
     }
  }

  revalidatePath(`/project/${test.projectId}`);
  revalidatePath(`/p/${test.projectId}`); // If revalidation needed
}

export async function createChallenger(winnerVariantId: string) {
   // Copy variant to new DRAFT
   const source = await prisma.landingPageVariant.findUnique({ where: { id: winnerVariantId } });
   if (!source) throw new Error("Source not found");
   
   const newVariant = await prisma.landingPageVariant.create({
      data: {
         projectId: source.projectId,
         version: source.version + 1, // Logic for versioning might need Project-scoped max version lookup
         status: 'DRAFT',
         pageJson: source.pageJson as any,
         // No slug
      }
   });
   
   
   return newVariant;
}

export async function stopTest(testId: string) {
  return prisma.aBTest.update({
    where: { id: testId },
    data: {
      status: 'STOPPED',
      endedAt: new Date()
    }
  });
}
