import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AnalyticsService } from "@/lib/analytics";
import { prisma } from "@/lib/db";

// Validation Schema
const trackViewSchema = z.object({
  projectId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  slug: z.string().min(1).max(255),
  referrer: z.string().optional().nullable(),
  utm: z.record(z.string(), z.string().optional()).optional(),
  sessionKey: z.string().uuid().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = trackViewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid Input" }, { status: 400 });
    }

    const { projectId, variantId, slug, referrer, utm, sessionKey } = result.data;
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || undefined;

    // Rate Limit Check (Basic: max 60 views per minute per IP hash)
    // In a real high-scale app, use Redis. for Local/SQLite, this query is fast enough.
    const ipHash = AnalyticsService.getIpHash(ip);
    const recentViews = await prisma.pageViewEvent.count({
      where: {
        ipHash,
        createdAt: {
          gt: new Date(Date.now() - 60 * 1000) // last 1 minute
        }
      }
    });

    if (recentViews > 60) {
       return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    // Record View
    await AnalyticsService.recordView({
      projectId,
      variantId,
      slug,
      ip,
      sessionKey,
      userAgent,
      referrer,
      utm,
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error("Track View Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
