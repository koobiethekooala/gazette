"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { triggerHaptic } from "@/lib/haptics";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => {
        triggerHaptic();
        toggleTheme();
      }}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === "dark" ? (
        <Sun className="theme-toggle-icon" aria-hidden="true" strokeWidth={1.75} />
      ) : (
        <Moon className="theme-toggle-icon" aria-hidden="true" strokeWidth={1.75} />
      )}
    </button>
  );
}
