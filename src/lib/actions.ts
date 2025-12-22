'use server';

import { cookies } from 'next/headers';
import { SETTINGS_COOKIE } from './llm/provider';
import { GenerationConfig } from './llm/types';
import { OpenAIClient } from './llm/openai';

import { redirect } from 'next/navigation';
import { getDevUser } from './db';
import * as projectRepo from './repositories/project';
import * as researchRepo from './repositories/research';
import * as assetsRepo from './repositories/assets';
import * as offerRepo from './repositories/offer';

// ============================================
// PROJECT ACTIONS
// ============================================

export interface CreateProjectInput {
  idea: string;
  targetMarket: string;
  revenueGoal: string;
  brandVoiceBrief: string;
}

export async function createProject(input: CreateProjectInput) {
  const user = await getDevUser();
  
  const project = await projectRepo.createProject({
    idea: input.idea,
    targetMarket: input.targetMarket,
    revenueGoal: input.revenueGoal,
    brandVoiceBrief: input.brandVoiceBrief,
    userId: user.id,
  });
  
  redirect(`/project/${project.id}/research`);
}

export async function getProject(id: string) {
  return projectRepo.getProject(id);
}

export async function getProjectWithDetails(id: string) {
  return projectRepo.getProjectWithDetails(id);
}

export async function getUserProjects() {
  const user = await getDevUser();
  return projectRepo.listProjects(user.id);
}

export async function listAllProjects() {
  const user = await getDevUser();
  return projectRepo.listProjects(user.id);
}

import { researchService } from './services/research/service';

// ============================================
// RESEARCH ACTIONS
// ============================================

export async function getLatestResearch(projectId: string) {
  return researchRepo.getLatestResearchReport(projectId);
}

export async function generateResearch(projectId: string, forceRefresh = false) {
  const report = await researchService.generate(projectId, forceRefresh);
  return { success: true, reportId: report.id };
}

// ============================================
// ASSETS ACTIONS (stubs for future)
// ============================================

import { assetService } from './services/assets/service';

export async function getLatestAssets(projectId: string) {
  return assetsRepo.getLatestAssetBundle(projectId);
}

export async function generateAssets(projectId: string) {
  const bundle = await assetService.generate(projectId);
  return { success: true, bundleId: bundle.id };
}

// ============================================
// OFFER ACTIONS
// ============================================

import { offerService } from './services/offer/service';
import type { OfferContentJson, SectionKey } from './services/offer/types';

export async function getLatestOffer(projectId: string) {
  return offerRepo.getLatestOffer(projectId);
}

export async function generateOffer(projectId: string) {
  const offer = await offerService.generate(projectId);
  return { success: true, offerId: offer.id };
}

export async function saveOfferEdits(offerId: string, patch: Partial<OfferContentJson>) {
  const offer = await offerService.saveEdits(offerId, patch);
  return { success: true, offerId: offer.id };
}

export async function regenerateOfferSections(offerId: string, sections: SectionKey[]) {
  const offer = await offerService.regenerateSections(offerId, sections);
  return { success: true, offerId: offer.id };
}

// ============================================
// SETTINGS ACTIONS
// ============================================

export async function saveGenerationSettings(settings: GenerationConfig) {
  const cookieStore = await cookies();
  // Encrypt? For dev tool, base64 is enough obfuscation against shoulder surfing
  const value = Buffer.from(JSON.stringify(settings)).toString('base64');
  cookieStore.set(SETTINGS_COOKIE, value, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  return { success: true };
}



export async function checkOpenAIStatus(apiKey: string) {
  if (!apiKey) return { success: false, error: 'API Key missing' };
  try {
    // List models to verify key
    const _client = new OpenAIClient(apiKey); // Created for potential future use
    // Tweak OpenAIClient to allow model listing or just try a dummy generation?
    // Using simple fetch here to avoid modifying Client just for auth check if Client is strict
    const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` }
    });
    
    if (res.ok) return { success: true };
    const err = await res.json();
    return { success: false, error: err.error?.message || 'Invalid API Key' };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}
