"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

export function ReaderBack() {
  return (
    <Link
      href="/"
      className="reader-back"
      aria-label="Back"
      transitionTypes={["nav-back"]}
      onClick={() => triggerHaptic()}
    >
      <ChevronLeft
        className="reader-back-icon"
        aria-hidden="true"
        strokeWidth={2.5}
      />
    </Link>
  );
}
