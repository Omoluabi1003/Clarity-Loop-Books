"use client";

import { ArrowLeft, Sparkles, X } from "lucide-react";

export function AuthShell({ eyebrow, title, description, children, onClose, onBack }: { eyebrow: string; title: string; description: string; children: React.ReactNode; onClose: () => void; onBack?: () => void; }) {
  return <div className="account-overlay" role="dialog" aria-modal="true" aria-label={title}>
    <div className="account-ambient" aria-hidden="true" />
    <section className="auth-shell">
      <div className="auth-brand-panel">
        <button className="brand brand-light" onClick={onClose}><span className="brand-mark">CL</span><span><strong>Clarity Loop</strong><small>AI BOOK STUDIO</small></span></button>
        <div><p className="eyebrow"><Sparkles size={13} /> {eyebrow}</p><h1>{title}</h1><p>{description}</p></div>
        <small>Developed by ETL GIS Consulting LLC</small>
      </div>
      <div className="auth-form-panel">
        <div className="auth-panel-actions">{onBack && <button onClick={onBack}><ArrowLeft size={17} /> Back</button>}<button className="auth-close" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
        {children}
      </div>
    </section>
  </div>;
}
