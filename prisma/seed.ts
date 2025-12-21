import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');
  
  // Create or get dev user
  const user = await prisma.user.upsert({
    where: { email: 'dev@localhost' },
    update: {},
    create: {
      email: 'dev@localhost',
      name: 'Dev User',
    },
  });
  console.log(`✅ User: ${user.email}`);
  
  // Create sample projects
  const project1 = await prisma.project.upsert({
    where: { id: 'demo-project-1' },
    update: {},
    create: {
      id: 'demo-project-1',
      idea: 'AI-powered fitness coaching app that creates personalized workout and nutrition plans',
      targetMarket: 'Health-conscious millennials aged 25-40 who want to improve their fitness but lack time for personal trainers',
      revenueGoal: '$50,000/month within 12 months',
      brandVoiceBrief: 'Motivating, friendly, and science-backed. Speak like a supportive friend who happens to be a certified trainer.',
      userId: user.id,
    },
  });
  console.log(`✅ Project 1: ${project1.idea.substring(0, 40)}...`);
  
  const project2 = await prisma.project.upsert({
    where: { id: 'demo-project-2' },
    update: {},
    create: {
      id: 'demo-project-2',
      idea: 'SaaS platform for freelancers to manage clients, invoices, and project timelines',
      targetMarket: 'Independent freelancers and small agencies with 1-5 team members',
      revenueGoal: '$20,000 MRR within 6 months',
      brandVoiceBrief: 'Professional but approachable. Clear and efficient. Help freelancers feel organized and in control.',
      userId: user.id,
    },
  });
  console.log(`✅ Project 2: ${project2.idea.substring(0, 40)}...`);
  
  // Create sample research report for project 1
  const research = await prisma.researchReport.upsert({
    where: { 
      projectId_version: { projectId: project1.id, version: 1 }
    },
    update: {},
    create: {
      projectId: project1.id,
      version: 1,
      status: 'DRAFT',
      content: {
        marketSize: '$32 billion fitness app market',
        competitors: ['MyFitnessPal', 'Nike Training Club', 'Peloton'],
        opportunities: ['AI personalization gap', 'Busy professional segment underserved'],
        threats: ['High competition', 'User retention challenges'],
      },
      sources: [
        { url: 'https://example.com/fitness-market-report', title: 'Fitness App Market 2024' },
        { url: 'https://example.com/competitor-analysis', title: 'Competitor Landscape' },
      ],
    },
  });
  console.log(`✅ Research Report: v${research.version} (${research.status})`);
  
  // Create sample asset bundle for project 1
  const assets = await prisma.assetBundle.upsert({
    where: { 
      projectId_version: { projectId: project1.id, version: 1 }
    },
    update: {},
    create: {
      projectId: project1.id,
      version: 1,
      status: 'DRAFT',
      landingCopy: {
        headline: 'Your Personal AI Trainer, Available 24/7',
        subheadline: 'Get customized workouts and nutrition plans that adapt to your schedule and goals',
        cta: 'Start Your Free Trial',
      },
      emails: {
        welcome: 'Welcome to FitAI! Your journey to better health starts now...',
        dayThree: 'How are your first workouts going? Here are some tips...',
      },
      ads: {
        facebook: 'Tired of generic workout plans? Try AI-powered training that learns your body.',
        google: 'AI Fitness Coach | Personalized Workouts | Free Trial',
      },
    },
  });
  console.log(`✅ Asset Bundle: v${assets.version} (${assets.status})`);
  
  // Create sample offer for project 1
  const offer = await prisma.offer.upsert({
    where: { 
      projectId_version: { projectId: project1.id, version: 1 }
    },
    update: {},
    create: {
      projectId: project1.id,
      version: 1,
      status: 'DRAFT',
      tiers: [
        { name: 'Basic', price: 9.99, features: ['AI Workouts', 'Progress Tracking'] },
        { name: 'Pro', price: 19.99, features: ['Everything in Basic', 'Nutrition Plans', 'Video Library'] },
        { name: 'Elite', price: 49.99, features: ['Everything in Pro', '1:1 Coaching Call', 'Custom Meal Plans'] },
      ],
      upsells: [
        { name: 'Annual Plan', discount: '2 months free' },
        { name: 'Meal Prep Kit', price: 29.99 },
      ],
      guarantee: '30-day money-back guarantee. No questions asked.',
      rationale: 'Three-tier pricing captures different customer segments while Pro tier drives majority of revenue.',
    },
  });
  console.log(`✅ Offer: v${offer.version} (${offer.status})`);
  
  console.log('\n🎉 Seed completed successfully!');
  console.log(`   - 1 User`);
  console.log(`   - 2 Projects`);
  console.log(`   - 1 Research Report`);
  console.log(`   - 1 Asset Bundle`);
  console.log(`   - 1 Offer`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
