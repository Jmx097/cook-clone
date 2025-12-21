'use client';

import type { Offer } from '@/generated/prisma';

interface OfferMetadataProps {
  offer: Offer;
}

export function OfferMetadata({ offer }: OfferMetadataProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const statusStyle = {
    DRAFT: 'bg-yellow-500/10 text-yellow-500',
    FINAL: 'bg-green-500/10 text-green-500',
    FAILED: 'bg-red-500/10 text-red-500',
  }[offer.status];

  return (
    <div className="flex items-center gap-6 text-sm">
      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500 uppercase text-xs font-bold tracking-wider">Status</span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyle}`}>
          {offer.status}
        </span>
      </div>

      {/* Version */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500 uppercase text-xs font-bold tracking-wider">Version</span>
        <span className="text-gray-300">v{offer.version}</span>
      </div>

      {/* Created At */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500 uppercase text-xs font-bold tracking-wider">Generated</span>
        <span className="text-gray-300">{formatDate(offer.createdAt)}</span>
      </div>

      {/* Input Hash (truncated) */}
      {offer.inputHash && (
        <div className="flex items-center gap-2">
          <span className="text-gray-500 uppercase text-xs font-bold tracking-wider">Hash</span>
          <span className="text-gray-500 font-mono text-xs">{offer.inputHash.substring(0, 8)}...</span>
        </div>
      )}
    </div>
  );
}
