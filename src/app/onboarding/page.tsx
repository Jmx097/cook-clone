'use client';

import { useState } from 'react';
import { createProject } from '@/lib/actions';

export default function OnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    
    await createProject({
      idea: formData.get('idea') as string,
      targetMarket: formData.get('targetMarket') as string,
      revenueGoal: formData.get('revenueGoal') as string,
      brandVoiceBrief: formData.get('brandVoiceBrief') as string,
    });
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">🚀</span>
            <h1 className="text-3xl font-bold gradient-text">Business Builder OS</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Go from raw idea to revenue-ready in minutes
          </p>
        </div>
        
        {/* Form Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Let&apos;s build your business</h2>
          
          <form action={handleSubmit} className="space-y-6">
            {/* Business Idea */}
            <div>
              <label htmlFor="idea" className="block text-sm font-medium text-gray-300 mb-2">
                What&apos;s your business idea? *
              </label>
              <textarea
                id="idea"
                name="idea"
                required
                rows={3}
                placeholder="Describe your product or service idea..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white 
                         placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 
                         focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
            
            {/* Target Market */}
            <div>
              <label htmlFor="targetMarket" className="block text-sm font-medium text-gray-300 mb-2">
                Who is your target market? *
              </label>
              <input
                type="text"
                id="targetMarket"
                name="targetMarket"
                required
                placeholder="e.g., Small business owners aged 25-45"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white 
                         placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 
                         focus:border-transparent transition-all duration-200"
              />
            </div>
            
            {/* Revenue Goal */}
            <div>
              <label htmlFor="revenueGoal" className="block text-sm font-medium text-gray-300 mb-2">
                What&apos;s your revenue goal? *
              </label>
              <input
                type="text"
                id="revenueGoal"
                name="revenueGoal"
                required
                placeholder="e.g., $10,000/month within 6 months"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white 
                         placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 
                         focus:border-transparent transition-all duration-200"
              />
            </div>
            
            {/* Brand Voice */}
            <div>
              <label htmlFor="brandVoiceBrief" className="block text-sm font-medium text-gray-300 mb-2">
                Describe your brand voice *
              </label>
              <textarea
                id="brandVoiceBrief"
                name="brandVoiceBrief"
                required
                rows={2}
                placeholder="e.g., Professional yet friendly, authoritative but approachable..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white 
                         placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 
                         focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold 
                       rounded-xl shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-blue-500 
                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating your project...
                </span>
              ) : (
                'Start Building →'
              )}
            </button>
          </form>
        </div>
        
        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Your data is stored locally during this development phase
        </p>
      </div>
    </div>
  );
}
