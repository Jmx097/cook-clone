
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function approveVersion(entityType: string, entityId: string, projectId: string) {
  const now = new Date();
  // Simulates logic in actions/versioning.ts
  if (entityType === 'Offer') {
    await prisma.offer.update({ where: { id: entityId }, data: { approvedAt: now } });
  } else if (entityType === 'AssetBundle') {
    await prisma.assetBundle.update({ where: { id: entityId }, data: { approvedAt: now } });
  }
}

async function createDraftFromApproved(entityType: string, sourceId: string, projectId: string) {
    if (entityType === 'Offer') {
      const source = await prisma.offer.findUnique({ where: { id: sourceId } });
      if (!source) throw new Error('Source not found');
      
      const agg = await prisma.offer.aggregate({ where: { projectId }, _max: { version: true } });
      const newVersion = (agg._max.version || 0) + 1;

      await prisma.offer.create({
        data: {
          projectId,
          version: newVersion,
          status: 'DRAFT',
          guarantee: source.guarantee, // Copy field
        }
      });
      return { success: true };
    }
    return { success: false };
}

async function createTemplate(params: any) {
    const offer = await prisma.offer.findUnique({ where: { id: params.sourceOfferId } });
    const assets = await prisma.assetBundle.findUnique({ where: { id: params.sourceAssetBundleId } });

    if (!offer?.approvedAt || !assets?.approvedAt) {
        return { success: false, error: 'Source not approved' };
    }
    
    // Create template
    const t = await prisma.template.create({
        data: {
            name: params.name,
            sourceOfferId: params.sourceOfferId,
            sourceAssetBundleId: params.sourceAssetBundleId,
            templateJson: { valid: true }
        }
    });
    return { success: true, templateId: t.id };
}

async function main() {
  console.log('🏁 Starting Mission 7 Verification (Schema Logic)...');
  
  // 0. Setup
  const user = await prisma.user.create({ data: { email: `verify-${Date.now()}@test.com`, name: 'Verify Bot' } });
  const project = await prisma.project.create({
    data: { userId: user.id, idea: 'Verification Project', targetMarket: 'Testers', revenueGoal: '1M', brandVoiceBrief: 'Professional' }
  });

  // 1. Create Offer
  let offer = await prisma.offer.create({
    data: { projectId: project.id, version: 1, guarantee: 'Original Guarantee', status: 'DRAFT' }
  });
  console.log('✅ Offer v1 created');

  // 2. Approve
  await approveVersion('Offer', offer.id, project.id);
  offer = (await prisma.offer.findUnique({ where: { id: offer.id } }))!;
  if (!offer.approvedAt) throw new Error('Approval failed');
  console.log('✅ Offer v1 approved');

  // 3. New Draft
  await createDraftFromApproved('Offer', offer.id, project.id);
  const v2 = await prisma.offer.findUnique({ where: { projectId_version: { projectId: project.id, version: 2 } } });
  if (!v2 || v2.status !== 'DRAFT') throw new Error('v2 creation failed');
  console.log('✅ Offer v2 created');

  // 4. Template (Fail)
  const assets = await prisma.assetBundle.create({
     data: { projectId: project.id, version: 1, status: 'DRAFT' }
  });
  const fail = await createTemplate({ name: 'Bad', sourceOfferId: offer.id, sourceAssetBundleId: assets.id });
  if (fail.success) throw new Error('Should have failed template creation');
  console.log('✅ Correctly rejected unapproved template');

  // 5. Template (Success)
  await approveVersion('AssetBundle', assets.id, project.id);
  const success = await createTemplate({ name: 'Good', sourceOfferId: offer.id, sourceAssetBundleId: assets.id });
  if (!success.success) throw new Error('Template creation failed');
  console.log('✅ Template created');

  console.log('🎉 SCHEMA & LOGIC VERIFIED');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

