import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, disabled = true, onClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/50 p-8">
      <div className="text-gray-500 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-center max-w-md mb-6">{description}</p>
      <button
        disabled={disabled}
        onClick={onClick}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:from-purple-500 hover:to-blue-500 transition-all duration-200
                   shadow-lg shadow-purple-500/25"
      >
        {actionLabel}
      </button>
      {disabled && (
        <p className="text-xs text-gray-500 mt-3">Coming in a future mission</p>
      )}
    </div>
  );
}
