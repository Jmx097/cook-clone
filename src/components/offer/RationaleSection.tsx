'use client';

import type { OfferRationale } from '@/lib/services/offer/types';

interface RationaleSectionProps {
  rationale: OfferRationale;
  isEditing: boolean;
  onEdit: (rationale: OfferRationale) => void;
}

export function RationaleSection({ rationale, isEditing, onEdit }: RationaleSectionProps) {
  const handlePainPointChange = (index: number, field: string, value: string) => {
    const newMapping = [...rationale.painPointMapping];
    newMapping[index] = { ...newMapping[index], [field]: value };
    onEdit({ ...rationale, painPointMapping: newMapping });
  };

  const handleObjectionChange = (index: number, field: string, value: string) => {
    const newObjections = [...rationale.objectionsAndResponses];
    newObjections[index] = { ...newObjections[index], [field]: value };
    onEdit({ ...rationale, objectionsAndResponses: newObjections });
  };

  return (
    <div className="space-y-6">
      {/* Pain Point Mapping */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Pain Point Mapping</h3>
            <p className="text-sm text-gray-400">How each tier addresses customer pain points</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider pb-2 pr-4">Pain Point</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider pb-2 pr-4">Tier</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider pb-2">Deliverable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {rationale.painPointMapping.map((mapping, index) => (
                <tr key={index}>
                  <td className="py-3 pr-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={mapping.painPoint}
                        onChange={(e) => handlePainPointChange(index, 'painPoint', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-300">{mapping.painPoint}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {isEditing ? (
                      <select
                        value={mapping.tier}
                        onChange={(e) => handlePainPointChange(index, 'tier', e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
                      >
                        <option value="Starter">Starter</option>
                        <option value="Pro">Pro</option>
                        <option value="Premium">Premium</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        mapping.tier === 'Pro' ? 'bg-purple-500/10 text-purple-400' :
                        mapping.tier === 'Premium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {mapping.tier}
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={mapping.deliverable}
                        onChange={(e) => handlePainPointChange(index, 'deliverable', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-300">{mapping.deliverable}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Objections & Responses */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Common Objections & Responses</h3>
            <p className="text-sm text-gray-400">Pre-written responses to handle buyer hesitation</p>
          </div>
        </div>

        <div className="space-y-4">
          {rationale.objectionsAndResponses.map((item, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-red-400 font-medium text-sm">Q:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={item.objection}
                    onChange={(e) => handleObjectionChange(index, 'objection', e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                ) : (
                  <p className="text-sm text-white font-medium">{item.objection}</p>
                )}
              </div>
              <div className="flex items-start gap-3 ml-5">
                <span className="text-green-400 font-medium text-sm">A:</span>
                {isEditing ? (
                  <textarea
                    value={item.response}
                    onChange={(e) => handleObjectionChange(index, 'response', e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-purple-500 resize-none"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm text-gray-300">{item.response}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
