import { z } from 'zod';

export const ResearchReportSchema = z.object({
  executiveSummary: z.array(z.string()).describe('Key market insights and high-level findings'),
  icp: z.object({
    demographics: z.array(z.string()),
    psychographics: z.array(z.string()),
    painPoints: z.array(z.string()),
  }),
  marketAnalysis: z.object({
    tam: z.string().describe('Total Addressable Market size'),
    sam: z.string().describe('Serviceable Available Market size'),
    som: z.string().describe('Serviceable Obtainable Market size'),
    growthRate: z.string().describe('CAGR or growth trends'),
  }),
  competitors: z.array(z.object({
    name: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    pricing: z.string().optional(),
  })).describe('Top 3-5 competitors'),
  opportunities: z.array(z.string()),
  marketingAngles: z.array(z.string()),
});

export type ResearchReportSchemaType = z.infer<typeof ResearchReportSchema>;
