import { useState } from 'react';
import { useRouter, useDeployer } from '@/hooks';
import { Check, ChevronRight, Github, Shield, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AddRepoView() {
  const { navigate } = useRouter();
  const { installAgentWorkflow } = useDeployer();
  
  const [step, setStep] = useState(1);
  const [targetRepo, setTargetRepo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Simplified wizard for UI demonstration
  const handleNext = async () => {
    if (step === 1 && !targetRepo) return;
    
    if (step === 2) {
      setIsProcessing(true);
      try {
        const [owner, name] = targetRepo.split('/');
        if (!owner || !name) throw new Error('Format must be owner/repo');
        await installAgentWorkflow(owner, name);
        setStep(3);
      } catch (err) {
        alert(String(err));
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (step === 3) {
      navigate(`/repo/${targetRepo}`);
      return;
    }
    
    setStep(prev => prev + 1);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      <div className="mb-12">
        <h1 className="text-3xl font-black font-display mb-2 text-gradient text-center">Infiltrate Repository</h1>
        <p className="text-text-secondary text-center">Attach a RepoFlux Agent to any GitHub repository you own.</p>
      </div>

      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface border-y border-border">
          <div className="h-full bg-accent transition-all duration-500 ease-out" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
        </div>
        
        {[
          { num: 1, icon: Github, label: 'Target' },
          { num: 2, icon: Terminal, label: 'Install' },
          { num: 3, icon: Shield, label: 'Secure' }
        ].map(s => (
          <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
             <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-500 bg-void ${step >= s.num ? 'border-accent text-accent shadow-[0_0_15px_oklch(0.70_0.18_250_/_0.5)]' : 'border-border text-text-muted'}`}>
                {step > s.num ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
             </div>
             <span className={`text-xs font-bold uppercase tracking-wider ${step >= s.num ? 'text-text' : 'text-text-muted'}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
        {step === 1 && (
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold mb-4">Identify Target</h2>
            <p className="text-sm text-text-muted mb-6">Enter the full name of the repository you wish to orchestrate.</p>
            <input 
              type="text" 
              placeholder="owner/repo (e.g. chirag127/repoflux)" 
              className="w-full bg-surface border border-border rounded-md px-4 py-3 focus:outline-none focus:border-accent text-center font-mono placeholder:font-sans"
              value={targetRepo}
              onChange={e => setTargetRepo(e.target.value)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold mb-4">Install Workflow</h2>
            <p className="text-sm text-text-muted mb-6">RepoFlux will now commit <code className="text-accent bg-accent/10 px-1 py-0.5 rounded">repoflux-agent.yml</code> to {targetRepo}'s main branch.</p>
            {isProcessing && (
               <div className="flex justify-center mb-4">
                 <Terminal className="w-8 h-8 text-accent animate-pulse" />
               </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 glow-accent !shadow-success/30">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Agent Attached!</h2>
            <p className="text-sm text-text-muted">The control plane has established an uplink. You may now dispatch missions.</p>
          </div>
        )}

        <div className="mt-12 flex items-center gap-4">
          <Button 
             onClick={handleNext}
             disabled={isProcessing || (step === 1 && !targetRepo)}
             className="bg-accent hover:bg-accent/90 text-white font-bold px-8 shadow-[0_0_15px_oklch(0.70_0.18_250_/_0.3)] transition-all active:scale-95"
          >
             {isProcessing ? 'Processing Uplink...' : step === 3 ? 'Go to Dashboard' : <>{step === 1 ? 'Verify Target' : 'Inject Workflow'} <ChevronRight className="w-4 h-4 ml-1" /></>}
          </Button>
        </div>
      </div>
    </div>
  );
}
