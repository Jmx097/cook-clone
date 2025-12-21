import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { submitLead } from '@/actions/submitLead';
import { AbTestWrapper } from '@/components/public/AbTestWrapper';
import { SessionKeyField } from '@/components/public/SessionKeyField';

export default async function PublicPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ v?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const overrideId = sp.v;

  // 1. Find Entry Variant (The Router/Default)
  const entryVariant = await prisma.landingPageVariant.findUnique({
    where: { slug },
  });

  if (!entryVariant) {
    notFound();
  }

  // 2. Check for Active Test where this Entry is Control
  const activeTest = await prisma.aBTest.findFirst({
    where: {
        projectId: entryVariant.projectId,
        status: 'RUNNING',
        controlVariantId: entryVariant.id
    }
  });

  // 3. Determine Variant to Show
  let variantToShow = entryVariant;

  if (overrideId && overrideId !== entryVariant.id) {
     // Security: Only allow variants that are part of the active test OR published for this project?
     // For now, allow if it's a challenger in the active test.
     const isChallenger = activeTest?.challengerVariantIds?.toString().includes(overrideId); // JSON array check loose
     
     // Also allow if it is just a valid variant in general?
     // Strictness: If active test, restricted to test variants.
     if (isChallenger) {
         const v = await prisma.landingPageVariant.findUnique({ where: { id: overrideId }});
         if (v) variantToShow = v;
     }
  }

  const p = variantToShow.pageJson as any;
  const sections = p.sections || {};
  const { hero, problem, solution, leadForm, footer } = sections;

  return (
    <AbTestWrapper 
        test={activeTest} 
        currentVariantId={variantToShow.id} 
        entryId={entryVariant.id} 
        projectId={entryVariant.projectId}
        slug={slug}
    >
      <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
         {/* Theme Injection (Colors) could go here via style tag */}
         
         {/* Hero */}
         <section className="bg-gray-50 py-20 px-6 text-center">
            <div className="max-w-5xl mx-auto">
               <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-gray-900">{hero?.headline}</h1>
               <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">{hero?.subheadline}</p>
               <a href="#offer" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-lg shadow-blue-500/30">
                  {hero?.ctaText}
               </a>
               {hero?.bulletBenefits && hero.bulletBenefits.length > 0 && (
                  <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-600">
                     {hero.bulletBenefits.map((b: string, i: number) => (
                        <span key={i} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm">
                          <span className="text-green-500">✓</span> {b}
                        </span>
                     ))}
                  </div>
               )}
            </div>
         </section>
         
         {/* Problem & Solution */}
         <div className="max-w-4xl mx-auto py-20 px-6 space-y-20">
            {problem && (
               <section className="space-y-6">
                  <h3 className="text-3xl font-bold">The Problem</h3>
                  <div className="prose prose-lg text-gray-600">
                     {problem.paragraphs?.map((p: string, i: number) => <p key={i}>{p}</p>)}
                  </div>
               </section>
            )}
            
            {solution && (
               <section className="bg-blue-50 -mx-6 px-6 py-12 rounded-3xl space-y-6">
                  <h3 className="text-3xl font-bold text-blue-900">The Solution</h3>
                  <div className="prose prose-lg text-blue-800/80">
                     {solution.paragraphs?.map((p: string, i: number) => <p key={i}>{p}</p>)}
                  </div>
                  {solution.featureBullets && (
                     <ul className="grid sm:grid-cols-2 gap-4 mt-8">
                        {solution.featureBullets.map((b: string, i: number) => (
                           <li key={i} className="flex items-start gap-3 bg-white/50 p-4 rounded-xl">
                              <span className="text-blue-600 font-bold">★</span>
                              <span>{b}</span>
                           </li>
                        ))}
                     </ul>
                  )}
               </section>
            )}
         </div>

         {/* Lead Form */}
         <section id="offer" className="bg-gray-900 text-white py-24 px-6">
            <div className="max-w-lg mx-auto bg-gray-800 p-8 sm:p-12 rounded-2xl shadow-2xl border border-gray-700">
               <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold mb-2">{leadForm?.headline ?? 'Get Started'}</h2>
                  <p className="text-gray-400">{leadForm?.subheadline}</p>
               </div>
               
               <form action={async (formData) => { 
                  'use server';
                  await submitLead(formData);
               }} className="space-y-4">
                  <input type="hidden" name="variantId" value={variantToShow.id} />
                  <SessionKeyField />
                  
                  {/* Honeypot */}
                  <input type="text" name="_hp" className="hidden" tabIndex={-1} autoComplete="off" />

                  <div>
                     <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                     <input type="text" name="name" required className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                     <input type="email" name="email" required className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
                  </div>

                  {leadForm?.fieldsEnabled?.phone && (
                    <div>
                       <label className="block text-sm font-medium text-gray-400 mb-1">Phone (Optional)</label>
                       <input type="tel" name="phone" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
                    </div>
                  )}
                  
                  {leadForm?.fieldsEnabled?.message && (
                    <div>
                       <label className="block text-sm font-medium text-gray-400 mb-1">Message (Optional)</label>
                       <textarea name="message" rows={3} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"></textarea>
                    </div>
                  )}

                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg transition-colors shadow-lg shadow-blue-600/20 mt-4">
                     Submit Request
                  </button>
               </form>
            </div>
         </section>

         {/* Footer */}
         <footer className="bg-gray-950 text-gray-500 py-12 text-center text-sm">
            <div className="max-w-7xl mx-auto px-6">
               <p>{footer?.disclaimerText}</p>
               <p className="mt-4 text-xs opacity-50">Powered by CookAI (Local-First)</p>
            </div>
         </footer>
      </div>
    </AbTestWrapper>
  );
}
