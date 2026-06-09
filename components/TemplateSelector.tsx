import { BriefcaseBusiness, Compass, Feather, Heart, Rainbow, UserRound } from "lucide-react";
import { templates } from "@/lib/templates";
import type { BookTemplate } from "@/lib/types";

const icons = { Compass, Heart, Feather, BriefcaseBusiness, UserRound, Rainbow };
export function TemplateSelector({ onSelect }: { onSelect: (template: BookTemplate) => void }) {
  return <section className="templates-section" id="templates">
    <div className="section-heading"><div><p className="eyebrow">A THOUGHTFUL PLACE TO START</p><h2>Begin with a proven book shape</h2><p>Choose a template or start from a blank page. Every detail stays editable.</p></div></div>
    <div className="template-grid">{templates.map((template) => { const Icon = icons[template.icon as keyof typeof icons] ?? Compass; return <button className="template-card" key={template.id} onClick={() => onSelect(template)}><span className="template-icon"><Icon size={22} /></span><span><small>{template.eyebrow}</small><strong>{template.name}</strong><p>{template.description}</p></span><span className="template-arrow">→</span></button>; })}</div>
  </section>;
}
