import { GenerationSettings } from '@/components/settings/GenerationSettings';
import { UsageDashboard } from '@/components/settings/UsageDashboard';
import { getGenerationConfig } from '@/lib/llm/provider';

export default async function SettingsPage() {
  const config = await getGenerationConfig();

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your AI providers and usage limits.</p>
      </div>

      <section>
        <GenerationSettings initialConfig={config} />
      </section>

      <section>
        <UsageDashboard />
      </section>
    </div>
  );
}
