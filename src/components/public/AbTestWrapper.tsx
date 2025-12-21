'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { uuidv4 } from '@/lib/uuid';

interface AbTestWrapperProps {
  test: any; // Using any for simplicity in props, typically strict types preferred
  currentVariantId: string;
  entryId: string;
  projectId: string;
  slug: string;
  children: React.ReactNode;
}

export function AbTestWrapper({ test, currentVariantId, entryId, projectId, slug, children }: AbTestWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 1. Session Key Logic
      let sk = localStorage.getItem('sessionKey');
      if (!sk) {
        sk = uuidv4();
        localStorage.setItem('sessionKey', sk);
      }

      // 2. A/B Assignment Logic
      if (test && test.status === 'RUNNING') {
        const urlVariant = searchParams.get('v');
        
        // If we are on the Entry URL (control) and NO variant override is present (or we want to enforce stability)
        // We check assignment.
        
        // We use a deterministic hash of sessionKey + testId to pick variant
        // This avoids server roundtrip for assignment if we share logic.
        // OR we just use weighted random if no assignment stored.
        
        // Let's check if we already have an assignment in LocalStorage for this Test
        const storageKey = `ab_assign_${test.id}`;
        let assignedId = localStorage.getItem(storageKey);

        if (!assignedId) {
           // New Assignment
           // Logic: Weights are in test.trafficWeightsJson
           const weights = test.trafficWeightsJson || { [test.controlVariantId]: 100 };
           const variants = Object.keys(weights);
           const total = Object.values(weights).reduce((a: any, b: any) => a + b, 0) as number;
           let r = Math.random() * total;
           
           for (const vid of variants) {
              r -= (weights[vid] as number);
              if (r <= 0) {
                 assignedId = vid;
                 break;
              }
           }
           if (!assignedId) assignedId = variants[0];
           
           localStorage.setItem(storageKey, assignedId!);
        }

        // Redirect if needed
        if (assignedId !== currentVariantId) {
           // Only redirect if the current page is the ENTRY (control) or if we are strictly enforcing routing?
           // If user manually navigated to ?v=... that overrides.
           // But if urlVariant is empty, we are on default page.
           if (!urlVariant) {
             const newParams = new URLSearchParams(searchParams.toString());
             newParams.set('v', assignedId!);
             router.replace(`?${newParams.toString()}`);
             return; // Don't track view yet, wait for redirect
           }
        }
      }

      // 3. Track View (Beacon)
      // We fire this AFTER assignment check to avoid double counting on redirect
      try {
        await fetch('/api/track/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            variantId: currentVariantId,
            slug,
            sessionKey: sk,
            referrer: document.referrer,
            utm: Object.fromEntries(searchParams.entries())
          })
        });
      } catch (e) {
        console.error("Tracking failed", e);
      }

      setVisible(true);
    };

    init();
  }, [test, currentVariantId, router, searchParams, projectId, slug, entryId]);

  if (!visible && test && test.status === 'RUNNING' && !searchParams.get('v')) {
     // Hide content while deciding to redirect to avoid flash
     // But if not testing, or already has ?v=, show immediately
     return <div className="min-h-screen bg-white" />; // White flash better than wrong content
  }

  // If we decided NOT to redirect (or verified we are on correct variant), show content
  return <>{children}</>;
}
