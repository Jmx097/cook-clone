'use client';

import type { OfferGuarantee } from '@/lib/services/offer/types';

interface GuaranteeSectionProps {
  guarantee: OfferGuarantee;
  isEditing: boolean;
  onEdit: (guarantee: OfferGuarantee) => void;
}

export function GuaranteeSection({ guarantee, isEditing, onEdit }: GuaranteeSectionProps) {
  const handleFieldChange = (field: keyof OfferGuarantee, value: string | string[]) => {
    onEdit({ ...guarantee, [field]: value });
  };

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Guarantee & Risk Reversal</h3>
          <p className="text-sm text-gray-400">Build trust with a clear, honest guarantee</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Guarantee Type */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Type</label>
          {isEditing ? (
            <select
              value={guarantee.type}
              onChange={(e) => handleFieldChange('type', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="30-day satisfaction">30-Day Satisfaction Guarantee</option>
              <option value="60-day satisfaction">60-Day Satisfaction Guarantee</option>
              <option value="milestone-based">Milestone-Based Guarantee</option>
              <option value="conditional">Conditional Guarantee</option>
              <option value="limited">Limited Guarantee</option>
            </select>
          ) : (
            <p className="text-white font-medium capitalize">{guarantee.type}</p>
          )}
        </div>

        {/* Terms */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Terms</label>
          {isEditing ? (
            <textarea
              value={guarantee.terms}
              onChange={(e) => handleFieldChange('terms', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-300 focus:outline-none focus:border-purple-500 resize-none"
              rows={3}
            />
          ) : (
            <p className="text-gray-300">{guarantee.terms}</p>
          )}
        </div>

        {/* Exclusions */}
        {(guarantee.exclusions && guarantee.exclusions.length > 0) && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Exclusions</label>
            <ul className="space-y-1">
              {guarantee.exclusions.map((exclusion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="text-gray-600">•</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={exclusion}
                      onChange={(e) => {
                        const newExclusions = [...(guarantee.exclusions || [])];
                        newExclusions[index] = e.target.value;
                        handleFieldChange('exclusions', newExclusions);
                      }}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-gray-300 focus:outline-none focus:border-purple-500"
                    />
                  ) : (
                    <span>{exclusion}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Compliance Notes */}
        <div className="pt-4 border-t border-gray-800">
          <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
            <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-xs text-amber-500 font-medium mb-1">Compliance Note</p>
              {isEditing ? (
                <textarea
                  value={guarantee.complianceNotes}
                  onChange={(e) => handleFieldChange('complianceNotes', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                  rows={2}
                />
              ) : (
                <p className="text-xs text-gray-400">{guarantee.complianceNotes}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
