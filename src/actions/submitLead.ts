'use server';

import { prisma } from '@/lib/db';
import { z } from 'zod';
import { headers } from 'next/headers';
import { createHash } from 'crypto';
import { AnalyticsService } from '@/lib/analytics';

const LeadSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").max(100),
  phone: z.string().optional(),
  message: z.string().max(2000).optional(),
  honeypot: z.string().optional(), // Must be empty
  variantId: z.string(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

export async function submitLead(formData: FormData) {
  try {
    const raw = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      honeypot: formData.get('_hp'), // Client should use this name
      variantId: formData.get('variantId'),
      utm_source: formData.get('utm_source'),
      utm_medium: formData.get('utm_medium'),
      utm_campaign: formData.get('utm_campaign'),
    };

    const validated = LeadSchema.parse(raw);

    // Spam Check: Honeypot
    if (validated.honeypot && validated.honeypot.length > 0) {
      // Silent success
      return { success: true, message: 'Received' };
    }

    // Identify Variant
    const variant = await prisma.landingPageVariant.findUnique({
      where: { id: validated.variantId },
    });
    if (!variant) throw new Error('Invalid Page');

    // Rate Limit: IP Hash
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
    const ipHash = createHash('sha256').update(ip).digest('hex');

    // Check recent submissions (e.g. 5 in 10 mins)
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const count = await prisma.lead.count({
      where: {
        ipHash,
        createdAt: { gte: tenMinsAgo },
      },
    });

    if (count >= 5) {
      throw new Error('Too many submissions. Please try again later.');
    }

    // Helper for strings
    const str = (val: string | null | undefined) => (val && val !== 'null' ? val : ''); 

    // Save Lead
    const lead = await prisma.lead.create({
      data: {
        projectId: variant.projectId,
        landingPageVariantId: variant.id,
        name: validated.name,
        email: validated.email,
        phone: str(validated.phone),
        message: str(validated.message),
        ipHash,
        userAgent: headersList.get('user-agent'),
        utmJson: {
          source: str(validated.utm_source),
          medium: str(validated.utm_medium),
          campaign: str(validated.utm_campaign),
        },
      },
    });

    // Analytics: Record Conversion
    try {
      await AnalyticsService.recordConversion({
        projectId: variant.projectId,
        variantId: variant.id,
        leadId: lead.id,
        ip: headersList.get('x-forwarded-for') || '127.0.0.1',
        sessionKey: formData.get('sessionKey') as string | null,
        utm: {
          source: str(validated.utm_source),
          medium: str(validated.utm_medium),
          campaign: str(validated.utm_campaign),
        },
      });
    } catch (e) {
      console.error("Analytics conversion failed (non-blocking)", e);
    }

    // Audit Log could go here

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input', details: error.flatten() };
    }
    console.error('Lead submission failed', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
