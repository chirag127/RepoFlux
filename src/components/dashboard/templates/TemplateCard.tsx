import { FileText, Settings2, Trash2 } from 'lucide-react';
import type { PromptTemplate } from '@/types/prompt-template';

interface TemplateCardProps {
  template: PromptTemplate;
  onDelete: (id: string) => void;
}

export function TemplateCard({ template, onDelete }: TemplateCardProps) {
  return (
    <div className="glass-card rounded-xl p-6 flex flex-col group relative overflow-hidden transition-all hover:border-accent/50">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[50px] group-hover:bg-accent/15 transition-all"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
         <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-border">
            <FileText className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
         </div>
         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1.5 text-text-muted hover:text-accent rounded-md hover:bg-surface-hover">
              <Settings2 className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(template.id)} className="p-1.5 text-text-muted hover:text-error rounded-md hover:bg-surface-hover">
              <Trash2 className="w-4 h-4" />
            </button>
         </div>
      </div>

      <h3 className="font-bold text-lg mb-2 relative z-10">{template.name}</h3>
      <p className="text-sm text-text-secondary mb-4 flex-1 relative z-10 line-clamp-2">
        {template.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
        {template.variables?.map(v => (
          <span key={v} className="px-2 py-0.5 rounded text-[10px] font-mono bg-info/10 text-info border border-info/20">
            {v}
          </span>
        ))}
      </div>
      
      <div className="pt-4 border-t border-border/50 text-xs text-text-muted font-mono relative z-10 flex justify-between">
        <span>{new Date(template.createdAt).toLocaleDateString()}</span>
        <span className="flex gap-1">
          Used {template.usageCount} times
        </span>
      </div>
    </div>
  );
}
