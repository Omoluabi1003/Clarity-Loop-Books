import { CheckCircle2, LockKeyhole } from "lucide-react";
export function LockedFeatureCard({ eyebrow, title, description, outputs, onUpgrade }: { eyebrow: string; title: string; description: string; outputs: string[]; onUpgrade: () => void; }) {
  return <article className="locked-feature-card"><span className="locked-ribbon"><LockKeyhole size={12} /> Preview</span><p className="eyebrow">{eyebrow}</p><h3>{title}</h3><p>{description}</p><ul>{outputs.map((output) => <li key={output}><CheckCircle2 size={13} />{output}</li>)}</ul><button onClick={onUpgrade}><LockKeyhole size={14} /> Upgrade to activate</button><small>This module is part of Author Pro or Studio. Stripe activation is coming soon.</small></article>;
}
