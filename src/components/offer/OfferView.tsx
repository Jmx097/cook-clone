'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { generateOffer, saveOfferEdits, regenerateOfferSections } from '@/lib/actions';
import { EmptyState } from '@/components/EmptyState';
import { TiersGrid } from './TiersGrid';
import { GuaranteeSection } from './GuaranteeSection';
import { UpsellsList } from './UpsellsList';
import { RationaleSection } from './RationaleSection';
import { OfferMetadata } from './OfferMetadata';
import type { Offer } from '@/generated/prisma';
import type { OfferContentJson, OfferTier, OfferGuarantee, OfferUpsell, OfferRationale, SectionKey } from '@/lib/services/offer/types';

interface OfferViewProps {
  projectId: string;
  initialOffer: Offer | null;
}

export function OfferView({ projectId, initialOffer }: OfferViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [regenerateSection, setRegenerateSection] = useState<SectionKey | 'full' | null>(null);
  
  // Local edits state
  const [editedContent, setEditedContent] = useState<OfferContentJson | null>(null);
  
  const offer = initialOffer;
  const content = offer?.contentJson as unknown as OfferContentJson | null;
  const displayContent = editedContent || content;

  const handleGenerate = () => {
    startTransition(async () => {
      try {
        await generateOffer(projectId);
        router.refresh();
      } catch (error) {
        console.error('Failed to generate offer:', error);
        alert(error instanceof Error ? error.message : 'Failed to generate offer. Please ensure research is generated first.');
      }
    });
  };

  const handleSaveEdits = () => {
    if (!offer || !editedContent) return;
    
    startTransition(async () => {
      try {
        await saveOfferEdits(offer.id, editedContent);
        setEditedContent(null);
        setIsEditing(false);
        router.refresh();
      } catch (error) {
        console.error('Failed to save edits:', error);
        alert(error instanceof Error ? error.message : 'Failed to save edits.');
      }
    });
  };

  const handleRegenerate = (section: SectionKey | 'full') => {
    if (!offer) return;
    
    startTransition(async () => {
      try {
        if (section === 'full') {
          await generateOffer(projectId);
        } else {
          await regenerateOfferSections(offer.id, [section]);
        }
        setEditedContent(null);
        setIsEditing(false);
        setRegenerateSection(null);
        router.refresh();
      } catch (error) {
        console.error('Failed to regenerate:', error);
        alert(error instanceof Error ? error.message : 'Failed to regenerate section.');
      }
    });
  };

  const handleCancelEdit = () => {
    setEditedContent(null);
    setIsEditing(false);
  };

  const startEditing = () => {
    if (content) {
      setEditedContent({ ...content });
      setIsEditing(true);
    }
  };

  // Edit handlers
  const handleTierEdit = (index: number, tier: OfferTier) => {
    if (!editedContent) return;
    const newTiers = [...editedContent.tiers];
    // Find the tier by name and update it
    const tierIndex = newTiers.findIndex(t => t.name === tier.name);
    if (tierIndex >= 0) {
      newTiers[tierIndex] = tier;
      setEditedContent({ ...editedContent, tiers: newTiers });
    }
  };

  const handleGuaranteeEdit = (guarantee: OfferGuarantee) => {
    if (!editedContent) return;
    setEditedContent({ ...editedContent, guarantee });
  };

  const handleUpsellsEdit = (upsells: OfferUpsell[]) => {
    if (!editedContent) return;
    setEditedContent({ ...editedContent, upsells });
  };

  const handleRationaleEdit = (rationale: OfferRationale) => {
    if (!editedContent) return;
    setEditedContent({ ...editedContent, rationale });
  };

  // Empty state
  if (!offer && !isPending) {
    return (
      <EmptyState
        icon={
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        title="No offer created yet"
        description="Build a compelling offer with strategic pricing tiers, guarantees, upsells, and objection handlers designed to maximize conversions."
        actionLabel="Generate Offer"
        disabled={false}
        onClick={handleGenerate}
      />
    );
  }

  // Loading state
  if (isPending && !offer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/50 p-8">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-400">Building your offer...</p>
        <p className="text-xs text-gray-500 mt-2">This may take a moment</p>
      </div>
    );
  }

  if (!displayContent) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <p className="text-red-400">Offer content is missing or invalid.</p>
        <button
          onClick={handleGenerate}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
        >
          Regenerate Offer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
        <div className="flex items-center justify-between">
          {/* Metadata */}
          {offer && <OfferMetadata offer={offer} />}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  disabled={isPending}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdits}
                  disabled={isPending}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                {/* Regenerate Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setRegenerateSection(regenerateSection ? null : 'full')}
                    disabled={isPending}
                    className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {regenerateSection !== null && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => handleRegenerate('full')}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 rounded-t-lg"
                      >
                        Full Offer
                      </button>
                      <button
                        onClick={() => handleRegenerate('tiers')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
                      >
                        Tiers Only
                      </button>
                      <button
                        onClick={() => handleRegenerate('guarantee')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
                      >
                        Guarantee Only
                      </button>
                      <button
                        onClick={() => handleRegenerate('upsells')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
                      >
                        Upsells Only
                      </button>
                      <button
                        onClick={() => handleRegenerate('rationale')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 rounded-b-lg"
                      >
                        Rationale Only
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={startEditing}
                  disabled={isPending}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition-colors disabled:opacity-50"
                >
                  Edit
                </button>
                
                <button
                  onClick={handleGenerate}
                  disabled={isPending}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-blue-500 transition-all duration-200 disabled:opacity-50"
                >
                  {isPending ? 'Generating...' : 'New Version'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Positioning */}
      {displayContent.positioning && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Positioning</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">One-Liner</p>
              <p className="text-xl text-white font-medium">{displayContent.positioning.oneLiner}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Who It's For</p>
              <p className="text-gray-300">{displayContent.positioning.whoItsFor}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Why Now</p>
              <p className="text-gray-300">{displayContent.positioning.whyNow}</p>
            </div>
            {displayContent.positioning.uniqueMechanism && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Unique Mechanism</p>
                <p className="text-gray-300">{displayContent.positioning.uniqueMechanism}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pricing Tiers */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Pricing Tiers</h3>
        <TiersGrid
          tiers={displayContent.tiers}
          isEditing={isEditing}
          onTierEdit={handleTierEdit}
        />
      </div>

      {/* Two Column Layout for Guarantee and Upsells */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GuaranteeSection
          guarantee={displayContent.guarantee}
          isEditing={isEditing}
          onEdit={handleGuaranteeEdit}
        />
        <UpsellsList
          upsells={displayContent.upsells}
          isEditing={isEditing}
          onEdit={handleUpsellsEdit}
        />
      </div>

      {/* Rationale */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Why This Will Sell</h3>
        <RationaleSection
          rationale={displayContent.rationale}
          isEditing={isEditing}
          onEdit={handleRationaleEdit}
        />
      </div>

      {/* Click outside to close regenerate dropdown */}
      {regenerateSection !== null && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setRegenerateSection(null)}
        />
      )}
    </div>
  );
}
