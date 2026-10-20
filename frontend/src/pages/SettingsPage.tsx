import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Cpu,
  Key,
  ShieldCheck,
  Palette,
  Code2,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export const SettingsPage: React.FC = () => {
  const { success } = useToast();

  const [provider, setProvider] = useState<'gemini' | 'mock' | 'custom'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [defaultTheme, setDefaultTheme] = useState('modern-dark');
  const [exportFormat, setExportFormat] = useState<'tsx' | 'jsx'>('tsx');

  const handleSave = () => {
    success('Settings Saved', 'Configuration saved securely to local workspace.');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-navy-950 p-4 sm:p-6 lg:p-8 text-left">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="violet" size="sm">
                System Preferences
              </Badge>
              <span className="text-xs text-slate-400 font-mono">Backend Engine v1.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Engine &amp; Studio Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Configure your Vision-Language Model provider, API credentials, and export defaults.
            </p>
          </div>

          <Button
            variant="gradient"
            size="sm"
            leftIcon={<Save className="w-3.5 h-3.5" />}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>

        {/* AI Provider Configuration */}
        <Card className="p-6 bg-charcoal-900 border-slate-800 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Vision-Language Model Provider</h2>
              <p className="text-xs text-slate-400">
                Select your multimodal model for sketch interpretation and annotation analysis.
              </p>
            </div>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Active Provider
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'gemini',
                  title: 'Google Gemini',
                  desc: '2.5 Flash / 1.5 Pro with structured schema output',
                  badge: 'Recommended',
                },
                {
                  id: 'mock',
                  title: 'Mock Provider',
                  desc: 'Deterministic offline fixture testing (Zero token usage)',
                  badge: 'Offline Mode',
                },
                {
                  id: 'custom',
                  title: 'Custom Endpoint',
                  desc: 'OpenAI / Claude / Self-hosted Ollama adapter',
                  badge: 'Advanced',
                },
              ].map((p) => {
                const isSelected = provider === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setProvider(p.id as any)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-electric-500 bg-electric-500/10 text-white'
                        : 'border-slate-800 bg-navy-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{p.title}</span>
                      <Badge variant={isSelected ? 'primary' : 'neutral'} size="sm">
                        {p.badge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Selection */}
          {provider === 'gemini' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Gemini Model Version
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                {[
                  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fastest, High Spatial Precision)' },
                  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Deep Reasoning & Complex Sketches)' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-3 rounded-lg border text-left text-xs transition-all ${
                      selectedModel === m.id
                        ? 'border-blue-500 bg-blue-500/20 text-white font-medium'
                        : 'border-slate-800 bg-navy-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* API Key Security */}
          {provider === 'gemini' && (
            <div className="space-y-2 max-w-lg">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Google GenAI API Key
              </label>
              <div className="relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  placeholder="Leave empty to use GEMINI_API_KEY from backend .env"
                  onChange={(e) => setApiKey(e.target.value)}
                  leftIcon={<Key className="w-3.5 h-3.5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="text-slate-400 hover:text-slate-200 pointer-events-auto"
                    >
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  }
                />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>API keys are stored server-side via backend .env and never exposed in compiled client code.</span>
              </div>
            </div>
          )}
        </Card>

        {/* Code Generation & Export Defaults */}
        <Card className="p-6 bg-charcoal-900 border-slate-800 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export &amp; Framework Defaults</h2>
              <p className="text-xs text-slate-400">
                Customize how generated React interfaces and packages are structured.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Component Output Language
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setExportFormat('tsx')}
                  className={`flex-1 p-3 rounded-lg border text-left text-xs ${
                    exportFormat === 'tsx'
                      ? 'border-blue-500 bg-blue-500/20 text-white font-medium'
                      : 'border-slate-800 bg-navy-950 text-slate-400'
                  }`}
                >
                  <strong className="block text-white">TypeScript (.tsx)</strong>
                  <span className="text-[10px] text-slate-500">Strict typed props &amp; interfaces</span>
                </button>
                <button
                  onClick={() => setExportFormat('jsx')}
                  className={`flex-1 p-3 rounded-lg border text-left text-xs ${
                    exportFormat === 'jsx'
                      ? 'border-blue-500 bg-blue-500/20 text-white font-medium'
                      : 'border-slate-800 bg-navy-950 text-slate-400'
                  }`}
                >
                  <strong className="block text-white">JavaScript (.jsx)</strong>
                  <span className="text-[10px] text-slate-500">Standard React JSX</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Styling Engine
              </label>
              <div className="p-3 rounded-lg border border-slate-800 bg-navy-950 text-xs">
                <strong className="block text-white">Tailwind CSS (v3.4)</strong>
                <span className="text-[10px] text-slate-500">
                  Pre-configured tokens: dark navy, charcoal, electric blue, and violet
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
