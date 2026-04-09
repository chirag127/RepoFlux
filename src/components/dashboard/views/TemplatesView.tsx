import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromptTemplate } from '@/types/prompt-template';
import { nanoid } from '@/lib/nanoid';
import { TemplateCard } from '../templates/TemplateCard';

const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: 't-1',
    name: 'Refactor to Solid',
    description: 'Refactors a given file or folder to follow SOLID principles.',
    template: 'Review the designated files for the {{component_name}} module. Refactor the code to strictly adhere to SOLID principles. Separate concerns, ensure single responsibility, and update unit tests accordingly.',
    variables: ['component_name'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    usageCount: 0
  },
  {
    id: 't-2',
    name: 'Security Audit',
    description: 'Perform a comprehensive security review.',
    template: 'Analyze the {{service_name}} service. Look for OWASP top 10 vulnerabilities including SQL injection, XSS, and broken auth. Provide patches for any issues found.',
    variables: ['service_name'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    usageCount: 0
  }
];

export function TemplatesView() {
  const [templates, setTemplates] = useState<PromptTemplate[]>(DEFAULT_TEMPLATES);

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };
  
  const handleCreate = () => {
    const newTemplate: PromptTemplate = {
      id: nanoid(),
      name: 'New Custom Template',
      description: 'Describe what this agent mission does...',
      template: 'System constraints: \n\nMission Context: {{target_context}} \n\nObjective: ...',
      variables: ['target_context'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      usageCount: 0
    };
    setTemplates([newTemplate, ...templates]);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
       <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-display mb-2 text-gradient">Prompt Templates</h1>
          <p className="text-text-secondary">Reusable mission parameters and system prompts for agents.</p>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-accent hover:bg-accent/90 text-white shadow-[0_0_15px_oklch(0.70_0.18_250_/_0.2)]"
        >
          <Plus className="w-4 h-4 mr-2" /> New Template
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <TemplateCard 
            key={template.id}
            template={template}
            onDelete={handleDelete}
          />
        ))}

        {templates.length === 0 && (
          <div className="col-span-full p-12 text-center text-text-muted border border-dashed border-border rounded-xl">
            No templates found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
