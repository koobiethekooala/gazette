"use client";

import { Check, Share } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { triggerHaptic } from "@/lib/haptics";

type ShareButtonProps = {
  title: string;
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
  return `Check out this article "${truncateTitle(title)}" ${url}`;
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
    /* ignore */
  }
}

/** Imperative toast on document.body — avoids React/ViewTransition containing blocks. */
function showDomToast(message: string) {
  const existing = document.getElementById("gazette-share-toast");
  existing?.remove();

  const el = document.createElement("div");
  el.id = "gazette-share-toast";
  el.setAttribute("role", "status");
  el.textContent = message;
  Object.assign(el.style, {
    position: "fixed",
    left: "50%",
    bottom: "calc(1.75rem + env(safe-area-inset-bottom, 0px))",
    zIndex: "2147483647",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.7rem 1.1rem",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.22)",
    background: "#111110",
    color: "#f5f0e8",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "0.82rem",
    fontWeight: "650",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
    pointerEvents: "none",
    transform: "translateX(-50%)",
    boxShadow: "0 10px 32px rgba(0,0,0,0.55)",
    opacity: "0",
    transition: "opacity 200ms ease",
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = "1";
  });
  window.setTimeout(() => {
    el.style.opacity = "0";
    window.setTimeout(() => el.remove(), 220);
  }, TOAST_MS);
}

export function ShareButton({ title, articleId }: ShareButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastTap = useRef(0);
  const [active, setActive] = useState(false);
  const activeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function runShare() {
    const now = Date.now();
    if (now - lastTap.current < 450) return;
    lastTap.current = now;

    triggerHaptic();
    const url = window.location.href || `/article/${articleId}`;
    copyText(buildShareText(title, url));

    setActive(true);
    if (activeTimer.current) clearTimeout(activeTimer.current);
    activeTimer.current = setTimeout(() => setActive(false), TOAST_MS + 250);

    showDomToast("Link copied");
  }

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    const handle = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      runShare();
    };

    el.addEventListener("click", handle, true);
    el.addEventListener("touchend", handle, true);
    el.addEventListener("pointerup", handle, true);
    return () => {
      el.removeEventListener("click", handle, true);
      el.removeEventListener("touchend", handle, true);
      el.removeEventListener("pointerup", handle, true);
      if (activeTimer.current) clearTimeout(activeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, articleId]);

  return (
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
        WebkitTapHighlightColor: "rgba(255,255,255,0.2)",
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
  );
}
