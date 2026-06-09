import { BriefcaseBusiness, Feather, Heart, Rainbow, Sparkles, UserRound } from "lucide-react";
import { templates } from "@/lib/templates";
import type { BookTemplate } from "@/lib/types";

const icons = { Sparkles, Heart, Feather, BriefcaseBusiness, UserRound, Rainbow };

export function TemplateSelector({ onSelect }: { onSelect: (template: BookTemplate) => void }) {
  return (
    <section className="templates-section" id="templates">
      <div className="section-heading">
        <div><p className="eyebrow">A helpful head start</p><h2>Start with a proven book shape</h2><p>Choose a template and make it yours. You can change anything along the way.</p></div>
        <span className="text-link">6 guided templates</span>
      </div>
      <div className="template-grid">
        {templates.map((template) => {
          const Icon = icons[template.icon as keyof typeof icons];
          return (
            <button className="template-card" key={template.id} onClick={() => onSelect(template)}>
              <span className={`template-icon ${template.color}`}><Icon size={22} strokeWidth={1.8} /></span>
              <span className="template-copy"><small>{template.eyebrow}</small><strong>{template.name}</strong><span>{template.description}</span></span>
              <span className="template-arrow">→</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
