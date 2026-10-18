import type { CSSProperties } from "react";

type PublicationBylineProps = {
  name: string;
  className?: string;
};

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

/** Hue from name so each publication gets a stable tint. */
function hueFor(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

export function PublicationByline({ name, className }: PublicationBylineProps) {
  const initials = initialsFor(name);
  const hue = hueFor(name);
  const rootClass = ["article-publication", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <span
        className="article-publication-avatar"
        style={{ "--avatar-hue": String(hue) } as CSSProperties}
        aria-hidden="true"
      >
        {initials}
      </span>
      <span className="article-publication-name">{name}</span>
    </div>
  );
}
