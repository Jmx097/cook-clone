'use client';

import { useState, useTransition } from 'react';
import { saveGenerationSettings } from '@/lib/actions'; 
import { checkOpenAIKey } from '@/actions/openai';

type ProviderType = 'mock' | 'openai';

interface Props {
  initialConfig?: {
    provider: ProviderType;
    apiKey?: string;
    model?: string;
  };
}

export function GenerationSettings({ initialConfig }: Props) {
  const [isPending, startTransition] = useTransition();
  const [provider, setProvider] = useState<ProviderType>(initialConfig?.provider || 'mock');
  const [model, setModel] = useState(initialConfig?.model || '');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveGenerationSettings({
          provider,
          apiKey: undefined, 
          model: model || (provider === 'openai' ? 'gpt-4o' : undefined),
        });
        setStatus('success');
        setMessage('Settings saved successfully.');
      } catch {
        setStatus('error');
        setMessage('Failed to save settings.');
      }
    });
  };

  const handleTest = () => {
    startTransition(async () => {
      setMessage('Testing connection...');
      setStatus('idle');
      try {
        let result: { success: boolean; error?: string; message?: string } = { success: false };
        
        if (provider === 'openai') {
          const check = await checkOpenAIKey();
          result = { 
              success: check.connected, 
              error: check.connected ? undefined : check.message,
              message: check.message
          };
        } else {
          result = { success: true, message: 'Mock provider always active' };
        }

        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Connection successful!');
        } else {
          setStatus('error');
          setMessage(`Connection failed: ${result.error || result.message}`);
        }
      } catch {
        setStatus('error');
        setMessage('Test failed due to network error.');
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Generation Settings</h3>
        {status === 'success' && <span className="text-emerald-600 text-sm">{message}</span>}
        {status === 'error' && <span className="text-red-600 text-sm">{message}</span>}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
          <select 
            value={provider} 
            onChange={(e) => setProvider(e.target.value as ProviderType)}
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="mock">Mock (Default / Free)</option>
            <option value="openai">OpenAI (Primary / Cloud)</option>
          </select>
          <p className="mt-1 text-sm text-slate-500">
            {provider === 'mock' && "Uses deterministic, fake data. No setup required."}
            {provider === 'openai' && "High quality. Requires OPENAI_API_KEY in server environment."}
          </p>
        </div>

        {provider === 'openai' && (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <h4 className="text-sm font-medium text-blue-900 mb-2">BYOK Configuration</h4>
            <p className="text-sm text-blue-800 mb-3">
              This application does not store API keys in the browser. 
              Please verify your key is set in your server&apos;s environment variables (<code>OPENAI_API_KEY</code>).
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleTest}
                    disabled={isPending}
                    className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isPending ? 'Checking...' : 'Check Server Connection'}
                </button>
            </div>
          </div>
        )}

        {provider === 'openai' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Model Name</label>
            <input 
              type="text" 
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
