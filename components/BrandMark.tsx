import Image from "next/image";
import logo from "../CL AI Logo.png";

type BrandMarkProps = {
  priority?: boolean;
};

export function BrandMark({ priority = false }: BrandMarkProps) {
  return (
    <span className="brand-mark logo-mark" aria-hidden="true">
      <Image src={logo} alt="" priority={priority} sizes="42px" />
    </span>
  );
}
