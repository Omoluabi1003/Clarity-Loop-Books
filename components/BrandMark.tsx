import Image from "next/image";

type BrandMarkProps = {
  priority?: boolean;
};

export function BrandMark({ priority = false }: BrandMarkProps) {
  return (
    <span className="brand-mark logo-mark" aria-hidden="true">
      <Image src="/icon.png" alt="" width={512} height={512} priority={priority} sizes="42px" />
    </span>
  );
}
