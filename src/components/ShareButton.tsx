"use client";

import { Check, Share } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { triggerHaptic } from "@/lib/haptics";

type ShareButtonProps = {
  title: string;
  articleId: string;
};

const TITLE_MAX = 72;
const TOAST_HOLD_MS = 1700;
const TOAST_FADE_MS = 280;

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
    Object.assign(ta.style, {
      position: "fixed",
      left: "-9999px",
      top: "0",
      opacity: "0",
    });
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  } catch {
    /* still show feedback */
  }
}

export function ShareButton({ title, articleId }: ShareButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastTap = useRef(0);
  const [active, setActive] = useState(false);
  const [toastOn, setToastOn] = useState<boolean | null>(null);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    for (const t of timers.current) clearTimeout(t);
    timers.current = [];
  }

  useEffect(() => {
    setPortalEl(document.body);
    return clearTimers;
  }, []);

  function runShare() {
    const now = Date.now();
    if (now - lastTap.current < 450) return;
    lastTap.current = now;

    triggerHaptic();
    const url = window.location.href || `/article/${articleId}`;
    copyText(buildShareText(title, url));

    clearTimers();
    setActive(true);
    setToastOn(true);

    timers.current.push(
      setTimeout(() => setToastOn(false), TOAST_HOLD_MS),
      setTimeout(() => setToastOn(null), TOAST_HOLD_MS + TOAST_FADE_MS),
      setTimeout(() => setActive(false), TOAST_HOLD_MS + TOAST_FADE_MS),
    );
  }

  // Capture-phase listeners survive cases where React's onClick is missed.
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    const onClick = (event: Event) => {
      event.preventDefault();
      runShare();
    };
    const onTouchEnd = (event: Event) => {
      event.preventDefault();
      runShare();
    };

    el.addEventListener("click", onClick, true);
    el.addEventListener("touchend", onTouchEnd, true);
    return () => {
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("touchend", onTouchEnd, true);
    };
    // title/articleId captured via closure; rebind when they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, articleId]);

  const toast =
    portalEl &&
    toastOn !== null &&
    createPortal(
      <div
        role="status"
        aria-live="assertive"
        style={{
          position: "fixed",
          left: "50%",
          bottom: "calc(1.75rem + env(safe-area-inset-bottom, 0px))",
          zIndex: 2147483646,
          display: "flex",
          alignItems: "center",
          gap: "0.45rem",
          padding: "0.7rem 1.05rem",
          borderRadius: "999px",
          border: "1px solid rgba(255,255,255,0.22)",
          background: "#111110",
          color: "#f5f0e8",
          fontFamily: "inherit",
          fontSize: "0.82rem",
          fontWeight: 650,
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          transform: "translate(-50%, 0)",
          boxShadow: "0 10px 32px rgba(0,0,0,0.55)",
          opacity: toastOn ? 1 : 0,
          transition: `opacity ${TOAST_FADE_MS}ms ease`,
        }}
      >
        <Check
          aria-hidden="true"
          strokeWidth={2.4}
          style={{ width: "1rem", height: "1rem" }}
        />
        Link copied
      </div>,
      portalEl,
    );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="reader-share"
        aria-label="Copy share link"
        title="Copy share link"
        style={{
          position: "fixed",
          top: "max(0.65rem, env(safe-area-inset-top))",
          right: "calc(0.7rem + 2.45rem + env(safe-area-inset-right, 0px))",
          zIndex: 60,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.5rem",
          height: "2.5rem",
          margin: 0,
          padding: 0,
          border: "none",
          background: "transparent",
          color: active ? "#f5f0e8" : "var(--ink-mute)",
          opacity: 1,
          cursor: "pointer",
          WebkitTapHighlightColor: "rgba(255,255,255,0.15)",
          touchAction: "manipulation",
        }}
      >
        {active ? (
          <Check
            aria-hidden="true"
            strokeWidth={2.4}
            style={{ width: "1.25rem", height: "1.25rem", display: "block" }}
          />
        ) : (
          <Share
            aria-hidden="true"
            strokeWidth={1.85}
            style={{ width: "1.2rem", height: "1.2rem", display: "block" }}
          />
        )}
      </button>
      {toast}
    </>
  );
}
