import Image from "next/image";

const LOGO_SRC = "/assets/branding/clarity-loop-logo.png";

type BrandLogoProps = {
  className?: string;
  context?: string;
  priority?: boolean;
  showName?: boolean;
};

export function BrandLogo({ className = "", context = "AI Book Studio", priority = false, showName = true }: BrandLogoProps) {
  return (
    <span className={`brand-logo ${showName ? "brand-logo-with-name" : "brand-logo-mark-only"} ${className}`.trim()}>
      <Image className="brand-logo-image" src={LOGO_SRC} alt="Clarity Loop AI Book Studio" width={1024} height={1024} sizes="(max-width: 640px) 44px, 52px" priority={priority} />
      {showName && <span className="brand-logo-copy"><strong>Clarity Loop</strong><small>{context}</small></span>}
    </span>
  );
}

export { LOGO_SRC };
