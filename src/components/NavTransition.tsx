"use client";

import type { ReactNode } from "react";
import { ViewTransition } from "react";

const navEnter = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "none",
} as const;

const navExit = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "none",
} as const;

/** Directional slide for feed ↔ article (iOS stack feel). */
export function NavTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={navEnter} exit={navExit} default="none">
      {children}
    </ViewTransition>
  );
}
