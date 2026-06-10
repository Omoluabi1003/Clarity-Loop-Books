import { ArrowUpRight, LockKeyhole } from "lucide-react";
export function UpgradePrompt({ message = "This module is part of Author Pro or Studio. Stripe activation is coming soon.", onViewPlans, compact = false }: { message?: string; onViewPlans: () => void; compact?: boolean; }) {
  return <div className={`upgrade-prompt ${compact ? "compact" : ""}`}><span><LockKeyhole size={18} /></span><div><strong>Unlock more of the studio</strong><p>{message}</p></div><button onClick={onViewPlans}>View plans <ArrowUpRight size={14} /></button></div>;
}
