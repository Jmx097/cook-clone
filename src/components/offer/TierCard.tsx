'use client';

import type { OfferTier } from '@/lib/services/offer/types';

interface TierCardProps {
  tier: OfferTier;
  isEditing: boolean;
  onEdit: (tier: OfferTier) => void;
  highlight?: boolean;
}

export function TierCard({ tier, isEditing, onEdit, highlight = false }: TierCardProps) {
  const handleDeliverableChange = (index: number, value: string) => {
    const newDeliverables = [...tier.deliverables];
    newDeliverables[index] = value;
    onEdit({ ...tier, deliverables: newDeliverables });
  };

  const handleFieldChange = (field: keyof OfferTier, value: string | number) => {
    onEdit({ ...tier, [field]: value });
  };

  const billingLabel = {
    'one-time': 'One-time',
    'monthly': '/mo',
    'annual': '/yr',
  }[tier.billing];

  const tierStyles = {
    Starter: 'border-gray-600',
    Pro: 'border-purple-500 ring-2 ring-purple-500/20',
    Premium: 'border-amber-500',
  }[tier.name];

  const tierBadge = {
    Starter: 'bg-gray-700 text-gray-300',
    Pro: 'bg-purple-600 text-white',
    Premium: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
  }[tier.name];

  return (
    <div className={`bg-gray-900/50 rounded-xl border ${tierStyles} p-6 flex flex-col h-full ${highlight ? 'scale-[1.02] shadow-lg shadow-purple-500/10' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${tierBadge}`}>
          {tier.name}
        </span>
        {tier.name === 'Pro' && (
          <span className="text-xs text-purple-400 font-medium">MOST POPULAR</span>
        )}
      </div>

      {/* Price */}
      <div className="mb-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">$</span>
            <input
              type="number"
              value={tier.price}
              onChange={(e) => handleFieldChange('price', parseInt(e.target.value) || 0)}
              className="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-3xl font-bold text-white focus:outline-none focus:border-purple-500"
            />
            <span className="text-gray-400">{billingLabel}</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">${tier.price}</span>
            <span className="text-gray-400">{billingLabel}</span>
          </div>
        )}
      </div>

      {/* Target Customer */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">For</p>
        {isEditing ? (
          <textarea
            value={tier.targetCustomer}
            onChange={(e) => handleFieldChange('targetCustomer', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-purple-500 resize-none"
            rows={2}
          />
        ) : (
          <p className="text-sm text-gray-300">{tier.targetCustomer}</p>
        )}
      </div>

      {/* Primary Outcome */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Intended Outcome</p>
        {isEditing ? (
          <textarea
            value={tier.primaryOutcome}
            onChange={(e) => handleFieldChange('primaryOutcome', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-purple-500 resize-none"
            rows={2}
          />
        ) : (
          <p className="text-sm text-gray-300 italic">{tier.primaryOutcome}</p>
        )}
      </div>

      {/* Deliverables */}
      <div className="flex-1 mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">What's Included</p>
        <ul className="space-y-2">
          {tier.deliverables.map((deliverable, index) => (
            <li key={index} className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isEditing ? (
                <input
                  type="text"
                  value={deliverable}
                  onChange={(e) => handleDeliverableChange(index, e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
                />
              ) : (
                <span className="text-sm text-gray-300">{deliverable}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Timeline */}
      <div className="mt-auto pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Timeline</span>
          {isEditing ? (
            <input
              type="text"
              value={tier.timeline}
              onChange={(e) => handleFieldChange('timeline', e.target.value)}
              className="w-32 bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-gray-300 text-right focus:outline-none focus:border-purple-500"
            />
          ) : (
            <span className="text-gray-300">{tier.timeline}</span>
          )}
        </div>
      </div>
    </div>
  );
}
