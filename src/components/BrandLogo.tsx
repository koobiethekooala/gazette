import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  title: string;
  href?: string;
  /** Compact mark for chrome / back nav */
  size?: "chrome" | "inline";
};

export function BrandLogo({
  title,
  href = "/",
  size = "chrome",
}: BrandLogoProps) {
  const className =
    size === "inline" ? "brand-logo brand-logo-inline" : "brand-logo";

  const mark = (
    <Image
      src="/logo.png"
      alt={title}
      width={1024}
      height={341}
      className="brand-logo-img"
      priority={size === "chrome"}
    />
  );

  if (href) {
    return (
      <Link href={href} className={className} aria-label={title}>
        {mark}
      </Link>
    );
  }

  return <span className={className}>{mark}</span>;
}
