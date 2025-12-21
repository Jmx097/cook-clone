'use client';

import type { OfferUpsell } from '@/lib/services/offer/types';

interface UpsellsListProps {
  upsells: OfferUpsell[];
  isEditing: boolean;
  onEdit: (upsells: OfferUpsell[]) => void;
}

export function UpsellsList({ upsells, isEditing, onEdit }: UpsellsListProps) {
  const handleUpsellChange = (index: number, field: keyof OfferUpsell, value: string | number) => {
    const newUpsells = [...upsells];
    newUpsells[index] = { ...newUpsells[index], [field]: value };
    onEdit(newUpsells);
  };

  const whenToOfferLabel = {
    'checkout': 'At Checkout',
    'post-purchase': 'Post-Purchase',
    'renewal': 'At Renewal',
  };

  const whenToOfferStyle = {
    'checkout': 'bg-blue-500/10 text-blue-400',
    'post-purchase': 'bg-green-500/10 text-green-400',
    'renewal': 'bg-purple-500/10 text-purple-400',
  };

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Upsells & Order Bumps</h3>
          <p className="text-sm text-gray-400">Additional offers to increase customer value</p>
        </div>
      </div>

      <div className="space-y-4">
        {upsells.map((upsell, index) => (
          <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Name */}
                <div className="flex items-center gap-2 mb-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={upsell.name}
                      onChange={(e) => handleUpsellChange(index, 'name', e.target.value)}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white font-medium focus:outline-none focus:border-purple-500"
                    />
                  ) : (
                    <h4 className="text-white font-medium">{upsell.name}</h4>
                  )}
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${whenToOfferStyle[upsell.whenToOffer]}`}>
                    {whenToOfferLabel[upsell.whenToOffer]}
                  </span>
                </div>

                {/* Why It Fits */}
                {isEditing ? (
                  <textarea
                    value={upsell.whyItFits}
                    onChange={(e) => handleUpsellChange(index, 'whyItFits', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-purple-500 resize-none"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm text-gray-400">{upsell.whyItFits}</p>
                )}
              </div>

              {/* Price */}
              <div className="text-right">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={upsell.price}
                      onChange={(e) => handleUpsellChange(index, 'price', parseInt(e.target.value) || 0)}
                      className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white font-bold text-right focus:outline-none focus:border-purple-500"
                    />
                  </div>
                ) : (
                  <span className="text-xl font-bold text-white">${upsell.price}</span>
                )}
              </div>
            </div>

            {/* When to Offer (edit mode) */}
            {isEditing && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <label className="text-xs text-gray-500 mr-2">When to offer:</label>
                <select
                  value={upsell.whenToOffer}
                  onChange={(e) => handleUpsellChange(index, 'whenToOffer', e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="checkout">At Checkout</option>
                  <option value="post-purchase">Post-Purchase</option>
                  <option value="renewal">At Renewal</option>
                </select>
              </div>
            )}
          </div>
        ))}

        {upsells.length === 0 && (
          <p className="text-center text-gray-500 py-4">No upsells configured</p>
        )}
      </div>
    </div>
  );
}
