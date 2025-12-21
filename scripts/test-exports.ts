
// Scripts usually run with ts-node.
// Usage: npx ts-node scripts/test-exports.ts

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Export Verification...");

  // 1. Setup Data
  const timestamp = Date.now();
  const user = await prisma.user.create({
    data: {
      email: `test-${timestamp}@example.com`,
      name: 'Test User'
    }
  });

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      idea: "Test Project",
      targetMarket: "Testers",
      revenueGoal: "1M",
      brandVoiceBrief: "Serious",
      researchReports: {
        create: {
          status: 'FINAL',
          version: 1,
          content: { summary: "Test Research" }
        }
      },
      offers: {
        create: {
          status: 'FINAL',
          version: 1,
          guarantee: "100%",
          rationale: "Works"
        }
      }
    }
  });

  console.log(`Created Project: ${project.id}`);

  // 2. Test ZIP Export (Backend logic only, mocks API trigger)
  // Minimal Check: Check DB schema and Job creation
  const job = await prisma.exportJob.create({
    data: {
      projectId: project.id,
      type: 'BUNDLE',
      status: 'QUEUED'
    }
  });
  
  if (job.status !== 'QUEUED') throw new Error("Job creation failed");
  console.log("Job Creation: OK");

  // 3. Security Path Traversal Check (Mock)
  // This logic is in the API route, hard to test from script without fetch.

  console.log("Verification Script Complete. (Note: Full E2E requires running app).");
  
  // Cleanup
  await prisma.exportJob.deleteMany({ where: { projectId: project.id } });
  await prisma.project.delete({ where: { id: project.id } });
  await prisma.user.delete({ where: { id: user.id } });

  console.log("Cleanup Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
