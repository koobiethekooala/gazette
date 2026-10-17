"use client";

import { hapticTrigger } from "ios-haptics";

let pulseSwitch: HTMLInputElement | null = null;

function isIosTouch(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** Off-screen switch used to pulse haptics (same Safari mechanism as ios-haptics). */
function ensurePulseSwitch(): HTMLInputElement | null {
  if (typeof document === "undefined" || !isIosTouch()) return null;
  if (pulseSwitch?.isConnected) return pulseSwitch;

  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  input.setAttribute("aria-hidden", "true");
  input.tabIndex = -1;
  Object.assign(input.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "1px",
    height: "1px",
    margin: "0",
    opacity: "0",
    pointerEvents: "none",
    zIndex: "-1",
  });
  document.body.appendChild(input);
  pulseSwitch = input;
  return input;
}

/** Fire a light haptic — works best during a user gesture (tap / scroll). */
export function triggerHaptic(): void {
  const el = ensurePulseSwitch();
  if (el) {
    el.checked = !el.checked;
    return;
  }
  // Non-iOS fallback (no-op on desktop Safari / most browsers)
  try {
    navigator.vibrate?.(8);
  } catch {
    /* ignore */
  }
}

/** Callback ref: overlay ios-haptics switch on tappable controls. */
export function hapticRef(element: HTMLElement | null): void {
  hapticTrigger(element);
}
