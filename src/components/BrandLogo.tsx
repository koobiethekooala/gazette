"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { clearFeedPosition } from "@/lib/feedPosition";

type BrandLogoProps = {
  title: string;
  /**
   * Destination for the logo link. Pass `null` to render a button instead
   * (same-page controls like scroll-to-top on the feed).
   */
  href?: string | null;
  /** Compact mark for chrome / back nav */
  size?: "chrome" | "inline";
  onClick?: (
    event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => void;
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

  if (href === null) {
    return (
      <button
        type="button"
        className={className}
        aria-label={title}
        onClick={onClick}
      >
        {mark}
      </button>
    );
  }

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
