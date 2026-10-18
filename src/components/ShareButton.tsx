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
const TOAST_MS = 2000;

function truncateTitle(title: string, max = TITLE_MAX): string {
  const trimmed = title.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function buildShareText(title: string, url: string): string {
  return `Check out this article ${truncateTitle(title)} ${url}`;
}

async function copyText(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      /* fall through */
    }
  }

  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

export function ShareButton({ title, articleId }: ShareButtonProps) {
  const [toastVisible, setToastVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  function showToast() {
    setToastVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setToastVisible(false), TOAST_MS);
  }

  function onShare() {
    triggerHaptic();
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : `/article/${articleId}`;
    const text = buildShareText(title, url);

    // Show toast immediately — clipboard can hang on non-HTTPS LAN localhost.
    showToast();
    void copyText(text);
  }

  const toast =
    mounted &&
    createPortal(
      <div
        className={
          toastVisible
            ? "reader-share-toast reader-share-toast-visible"
            : "reader-share-toast"
        }
        role="status"
        aria-live="polite"
        style={{
          position: "fixed",
          left: "50%",
          bottom: "max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))",
          zIndex: 9999,
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          margin: 0,
          padding: "0.6rem 0.95rem",
          borderRadius: "999px",
          border: "1px solid var(--rule, rgba(255,255,255,0.2))",
          background: "var(--ink, #1a1814)",
          color: "var(--paper, #f5f0e8)",
          fontSize: "0.78rem",
          fontWeight: 600,
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          transform: "translateX(-50%)",
          opacity: toastVisible ? 1 : 0,
          transition: "opacity 0.25s ease",
        }}
      >
        <Check
          className="reader-share-toast-icon"
          aria-hidden="true"
          strokeWidth={2.25}
          style={{ width: "0.9rem", height: "0.9rem", flex: "0 0 auto" }}
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
