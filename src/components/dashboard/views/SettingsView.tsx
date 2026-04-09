import { useState, useEffect } from 'react';
import { useAppStorage } from '@/hooks';
import { Save, Key, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

// The keys we support based on the Agent Registry and MCP Configs
const SUPPORTED_KEYS = [
  'GEMINI_API_KEY', 'GROQ_API_KEY', 'OPENROUTER_API_KEY', 
  'MISTRAL_API_KEY', 'CEREBRAS_API_KEY', 'QWEN_API_KEY',
  'CONTEXT7_API_KEY', 'REF_API_KEY', 'LINKUP_API_KEY', 
  'EXA_API_KEY', 'SERPER_API_KEY', 'TAVILY_API_KEY'
];

export function SettingsView() {
  const { updateConfig } = useAppStorage();
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [envText, setEnvText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success'>('idle');

  useEffect(() => {
    // Load keys from local storage for seamless client-side only security
    const loadedKeys: Record<string, string> = {};
    SUPPORTED_KEYS.forEach(key => {
      loadedKeys[key] = localStorage.getItem(`repoflux_key_${key}`) || '';
    });
    setKeys(loadedKeys);
  }, []);

  const handleKeyChange = (key: string, value: string) => {
    setKeys(prev => ({ ...prev, [key]: value }));
  };

  const handleBulkImport = () => {
    if (!envText.trim()) return;

    const newKeys = { ...keys };
    let importCount = 0;

    const lines = envText.split(/\r?\n/);
    lines.forEach(line => {
      const trimmed = line.trim();
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) return;

      const equalIndex = trimmed.indexOf('=');
      if (equalIndex === -1) return;

      const rawKey = trimmed.substring(0, equalIndex).trim();
      let rawVal = trimmed.substring(equalIndex + 1).trim();

      // Clean value (remove quotes)
      if ((rawVal.startsWith('"') && rawVal.endsWith('"')) || (rawVal.startsWith("'") && rawVal.endsWith("'"))) {
        rawVal = rawVal.substring(1, rawVal.length - 1);
      }

      if (SUPPORTED_KEYS.includes(rawKey)) {
        newKeys[rawKey] = rawVal;
        importCount++;
      }
    });

    setKeys(newKeys);
    setImportStatus('success');
    setEnvText('');
    
    setTimeout(() => setImportStatus('idle'), 3000);
    if (importCount > 0) {
      alert(`Successfully imported ${importCount} keys from .env content.`);
    } else {
      alert('No matching keys found in the provided text.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Save to local storage
    Object.entries(keys).forEach(([key, value]) => {
      if (value) {
        localStorage.setItem(`repoflux_key_${key}`, value);
      } else {
        localStorage.removeItem(`repoflux_key_${key}`);
      }
    });

    // We can also update the global config UI prefs here
    await updateConfig(prev => ({
      ...prev,
      updatedAt: Date.now()
    }));
    
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings & Keys saved securely to local storage.');
    }, 500);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-display mb-2 text-gradient">System Configuration</h1>
          <p className="text-text-secondary">Manage local API keys and Model Context Protocol settings.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-accent hover:bg-accent/90 text-white shadow-[0_0_15px_oklch(0.70_0.18_250_/_0.2)]"
        >
          <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </header>

      <div className="glass-card rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border/50 pb-4">
          <Key className="w-5 h-5 text-warning" /> Local API Keys (BYOT)
        </h2>
        <p className="text-sm text-text-muted mb-6">
          These keys are stored securely in your browser's Local Storage. They are dynamically encrypted and injected into target GitHub repositories only when you dispatch an agent mission.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SUPPORTED_KEYS.map(keyName => (
            <div key={keyName} className="space-y-2">
              <Label htmlFor={keyName} className="text-xs uppercase text-text-secondary">{keyName.replace(/_API_KEY/, '')}</Label>
              <Input 
                id={keyName}
                type="password"
                placeholder="************************"
                value={keys[keyName] || ''}
                onChange={e => handleKeyChange(keyName, e.target.value)}
                className="bg-surface/50 border-border focus:border-accent font-mono text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 mb-8 border-accent/20">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border/50 pb-4">
          <UploadCloud className="w-5 h-5 text-accent" /> Bulk Setup (.env Import)
        </h2>
        <p className="text-sm text-text-muted mb-6">
          Paste the contents of your `.env` file below to automatically populate all matching API keys.
        </p>

        <div className="space-y-4">
          <Textarea 
            placeholder={"GEMINI_API_KEY=...\nOPENROUTER_API_KEY=..."}
            className="h-40 bg-surface/50 border-border focus:border-accent font-mono text-sm resize-none custom-scrollbar"
            value={envText}
            onChange={e => setEnvText(e.target.value)}
          />
          <div className="flex justify-end">
             <Button 
              onClick={handleBulkImport} 
              disabled={!envText.trim()}
              variant="secondary"
              className="bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20"
            >
              {importStatus === 'success' ? (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Keys Imported</>
              ) : (
                <><UploadCloud className="w-4 h-4 mr-2" /> Sync .env Content</>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border/50 pb-4">
          <Server className="w-5 h-5 text-info" /> Agent Features
        </h2>
        <div className="space-y-6">
           <div className="flex items-center justify-between">
            <div>
              <Label className="text-base text-text">Sequential Thinking (Reasoner Loop)</Label>
              <p className="text-sm text-text-muted mt-1">Allows agents to perform self-correction and multi-step reasoning before outputting code.</p>
            </div>
            <Switch checked={true} disabled />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base text-text">Web Search Resolution</Label>
              <p className="text-sm text-text-muted mt-1">Allows agents to query Linkup, Exa, or Serper to find modern context.</p>
            </div>
            <Switch checked={true} disabled />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base text-text">Docfork / SDK Fallback</Label>
              <p className="text-sm text-text-muted mt-1">Grants agents access to Context7 and Docfork for direct library API references.</p>
            </div>
            <Switch checked={true} disabled />
          </div>
        </div>
      </div>

    </div>
  );
}
