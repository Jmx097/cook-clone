'use client';

import type { OfferTier } from '@/lib/services/offer/types';
import { TierCard } from './TierCard';

interface TiersGridProps {
  tiers: OfferTier[];
  isEditing: boolean;
  onTierEdit: (index: number, tier: OfferTier) => void;
}

export function TiersGrid({ tiers, isEditing, onTierEdit }: TiersGridProps) {
  // Ensure we have all 3 tiers in the correct order
  const orderedTiers = ['Starter', 'Pro', 'Premium'].map(name => 
    tiers.find(t => t.name === name)
  ).filter(Boolean) as OfferTier[];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {orderedTiers.map((tier, index) => (
        <TierCard
          key={tier.name}
          tier={tier}
          isEditing={isEditing}
          onEdit={(updatedTier) => onTierEdit(index, updatedTier)}
          highlight={tier.name === 'Pro'}
        />
      ))}
    </div>
  );
}
