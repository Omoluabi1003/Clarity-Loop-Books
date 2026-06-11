import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export const BRAND_LOGO_PATH = "/branding/cl-ai-logo.png";
export const BRAND_NAME = "Clarity Loop AI Book Studio";

export function BrandLogo({ className = "", priority = false, sizes = "64px" }: BrandLogoProps) {
  return (
    <Image
      className={`brand-logo ${className}`.trim()}
      src={BRAND_LOGO_PATH}
      alt={BRAND_NAME}
      width={1024}
      height={1024}
      sizes={sizes}
      priority={priority}
    />
  );
}
