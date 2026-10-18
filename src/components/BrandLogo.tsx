"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { clearFeedPosition } from "@/lib/feedPosition";

type BrandLogoProps = {
  title: string;
  href?: string;
  /** Compact mark for chrome / back nav */
  size?: "chrome" | "inline";
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function BrandLogo({
  title,
  href = "/",
  size = "chrome",
  onClick,
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
      <Link
        href={href}
        className={className}
        aria-label={title}
        onClick={(event) => {
          // Logo means "home / top" — don't restore a mid-feed slide.
          if (href === "/") clearFeedPosition();
          onClick?.(event);
        }}
      >
        {mark}
      </Link>
    );
  }

  return <span className={className}>{mark}</span>;
}
