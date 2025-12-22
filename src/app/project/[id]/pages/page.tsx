import { prisma } from '@/lib/db';
import Link from 'next/link';
import { generateLandingPageVariant, createDraftFromPublished } from '@/actions/editorActions';


// Components
// import { Button } from '@/components/ui/button'; 

// I'll use standard HTML/Tailwind for now to avoid dependency guessing if UI lib is not fully scanned.
// Actually, `Button` likely exists. Detailed look at previous list_dir showed `components` folder. 
// I'll stick to raw Tailwind for safety unless I'm sure.

export default async function PagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const variants = await prisma.landingPageVariant.findMany({
    where: { projectId: id },
    orderBy: { version: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Landing Pages</h1>
          <p className="text-gray-400">Generate, edit, and publish your landing pages.</p>
        </div>
        <form action={async () => {
          'use server';
          await generateLandingPageVariant(id);
        }}>
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <span>✨</span>
            Generate New Page
          </button>
        </form>
      </div>

      <div className="grid gap-4">
        {variants.length === 0 ? (
          <div className="text-center p-12 border border-gray-800 rounded-xl bg-gray-900/50 text-gray-400">
            No landing pages yet. Click generate to start!
          </div>
        ) : (
          variants.map((v) => (
            <div key={v.id} className="p-6 border border-gray-800 rounded-xl bg-gray-900/50 hover:border-gray-700 transition-colors flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-semibold text-white">
                    {v.title || `Version ${v.version}`}
                  </h3>
                  <Badge status={v.status} />
                </div>
                <div className="text-sm text-gray-500">
                  Last updated {v.createdAt.toLocaleDateString()} • Version {v.version}
                  {v.slug && (
                    <span className="ml-2 text-blue-400">
                      • Published at <Link href={`/p/${v.slug}`} target="_blank" className="hover:underline">/p/{v.slug}</Link>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {v.status === 'PUBLISHED' && (
                   <form action={async () => {
                      'use server';
                      await createDraftFromPublished(v.id);
                   }}>
                      <button className="text-gray-400 hover:text-white px-3 py-1.5 rounded text-sm hover:bg-gray-800">
                        Edit (New Draft)
                      </button>
                   </form>
                )}
                
                {v.status === 'DRAFT' && (
                  <Link 
                    href={`/project/${id}/pages/${v.id}`}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Edit & Preview
                  </Link>
                )}

                <ExportButton variantId={v.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const styles = {
    DRAFT: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    PUBLISHED: 'bg-green-500/10 text-green-500 border-green-500/20',
    ARCHIVED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  } as const;
  
  const style = styles[status as keyof typeof styles] || styles.DRAFT;
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${style}`}>
      {status}
    </span>
  );
}

function ExportButton({ variantId: _variantId }: { variantId: string }) {
  // Client component for download usually, but here we invoke server action + open blob?
  // Server Actions returning a blob/base64 need client side handler.
  // We'll make this a simple form submit that downloads? 
  // Actually, standard Next.js form action cannot easily trigger browser download of base64 without client JS.
  // I'll make a client component wrapper below or inline script?
  // Easier: Make a Client Component for this button.
  // Since I can't easily make a separate file right here comfortably without context switch, 
  // I will define it in a separate file `ExportButton.tsx` in a following step, 
  // OR just assume correct separation.
  // I'll put a placeholder for now or use a simple form that might just log.
  // Wait, I can define `ExportButton` as a client component in a separate file to follow best practices.
  // I'll add a TODO comment or just use a form that does nothing visible for now but calls the action.
  // To handle the download, I DO need a client component.
  // I will omit ExportButton logic here and create `ExportButton.tsx` next.
  return <div />;
}
