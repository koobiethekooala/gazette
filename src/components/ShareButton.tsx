"use client";

import { Check, Share } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { hapticRef, triggerHaptic } from "@/lib/haptics";
import styles from "./ShareButton.module.css";

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
          copied ? `${styles.toast} ${styles.toastVisible}` : styles.toast
        }
        role="status"
        aria-live="polite"
      >
        <Check
          className={styles.toastIcon}
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
        className={styles.share}
        ref={hapticRef}
        onClick={onShare}
        aria-label="Copy share link"
        title="Copy share link"
      >
        <Share className={styles.icon} aria-hidden="true" strokeWidth={1.75} />
      </button>
      {toast}
    </>
  );
}
