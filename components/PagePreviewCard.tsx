interface PagePreviewCardProps {
  label: string;
  headline: string;
  summary: string;
  footer?: string;
}

export function PagePreviewCard({ label, headline, summary, footer }: PagePreviewCardProps) {
  return (
    <section className="success-card">
      <p className="success-kicker">{label}</p>
      <h3>{headline}</h3>
      <p>{summary}</p>
      {footer && <small>{footer}</small>}
    </section>
  );
}
