"use client";

import { Check, Share } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { hapticRef, triggerHaptic } from "@/lib/haptics";
import "./share-button.css";

type ShareButtonProps = {
  title: string;
  /** Stable article slug — used if `window.location` is unavailable. */
  articleId: string;
};

const TITLE_MAX = 72;

function truncateTitle(title: string, max = TITLE_MAX): string {
  const trimmed = title.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function buildShareText(title: string, url: string): string {
  return `Check out this article ${truncateTitle(title)} ${url}`;
}

export function ShareButton({ title, articleId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  async function onShare() {
    triggerHaptic();
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : `/article/${articleId}`;
    const text = buildShareText(title, url);

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }

    setCopied(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setCopied(false), 1800);
  }

  const toast =
    mounted &&
    createPortal(
      <div
        className={
          copied
            ? "reader-share-toast reader-share-toast-visible"
            : "reader-share-toast"
        }
        role="status"
        aria-live="polite"
        style={{
          position: "fixed",
          left: "50%",
          bottom: "max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))",
          zIndex: 80,
          transform: "translateX(-50%)",
          opacity: copied ? 1 : 0,
        }}
      >
        <Check
          className="reader-share-toast-icon"
          aria-hidden="true"
          strokeWidth={2.25}
        />
        Link copied
      </div>,
      document.body,
    );

  return (
    <>
      <button
        type="button"
        className="reader-share"
        ref={hapticRef}
        onClick={onShare}
        aria-label="Copy share link"
        title="Copy share link"
        style={{
          position: "fixed",
          top: "max(0.65rem, env(safe-area-inset-top))",
          right: "calc(0.7rem + 2.45rem + env(safe-area-inset-right, 0px))",
          zIndex: 50,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.25rem",
          height: "2.25rem",
          margin: 0,
          padding: 0,
          border: "none",
          background: "transparent",
          color: "var(--ink-mute)",
          opacity: 0.85,
          cursor: "pointer",
        }}
      >
        <Share
          className="reader-share-icon"
          aria-hidden="true"
          strokeWidth={1.75}
        />
      </button>
      {toast}
    </>
  );
}
