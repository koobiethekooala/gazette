"use client";

import { Check, Share } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { triggerHaptic } from "@/lib/haptics";
import "./share-button.css";

type ShareButtonProps = {
  title: string;
  /** Stable article slug — used if `window.location` is unavailable. */
  articleId: string;
};

const TITLE_MAX = 72;
const TOAST_HOLD_MS = 1700;
const TOAST_FADE_MS = 300;

function truncateTitle(title: string, max = TITLE_MAX): string {
  const trimmed = title.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function buildShareText(title: string, url: string): string {
  return `Check out this article ${truncateTitle(title)} ${url}`;
}

function copyText(text: string): void {
  try {
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    /* fall through */
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  } catch {
    /* ignore — toast still confirms the action */
  }
}

export function ShareButton({ title, articleId }: ShareButtonProps) {
  /** null = hidden, true = opaque, false = fading out */
  const [toastOn, setToastOn] = useState<boolean | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  function onShare() {
    triggerHaptic();

    const url = window.location.href || `/article/${articleId}`;
    copyText(buildShareText(title, url));

    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);

    setToastOn(true);
    fadeTimer.current = setTimeout(() => {
      setToastOn(false);
      hideTimer.current = setTimeout(() => setToastOn(null), TOAST_FADE_MS);
    }, TOAST_HOLD_MS);
  }

  return (
    <>
      <button
        type="button"
        className="reader-share"
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

      {toastOn !== null ? (
        <div
          className="reader-share-toast"
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            left: "50%",
            bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
            zIndex: 9999,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            margin: 0,
            padding: "0.65rem 1rem",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "#111110",
            color: "#f5f0e8",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            transform: "translateX(-50%)",
            boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
            opacity: toastOn ? 1 : 0,
            transition: `opacity ${TOAST_FADE_MS}ms ease`,
          }}
        >
          <Check
            aria-hidden="true"
            strokeWidth={2.25}
            style={{ width: "0.95rem", height: "0.95rem", flex: "0 0 auto" }}
          />
          Link copied
        </div>
      ) : null}
    </>
  );
}
