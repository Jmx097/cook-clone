export interface ResearchInput {
  projectId: string;
  idea: string;
  targetMarket: string;
  revenueGoal: string;
  brandVoiceBrief: string;
}

export interface ResearchReportContent {
  executiveSummary: string[];
  icp: {
    demographics: string[];
    psychographics: string[];
    painPoints: string[];
  };
  marketAnalysis: {
    tam: string;
    sam: string;
    som: string;
    growthRate: string;
  };
  competitors: Array<{
    name: string;
    strengths: string[];
    weaknesses: string[];
    pricing?: string;
  }>;
  opportunities: string[];
  marketingAngles: string[];
}

export interface Source {
  title: string;
  url: string;
  snippet?: string;
}

export interface ResearchResult {
  content: ResearchReportContent;
  sources: Source[];
}

export interface ResearchProvider {
  generate(input: ResearchInput): Promise<ResearchResult>;
}
