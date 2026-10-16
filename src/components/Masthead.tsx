import type { Issue } from "@/lib/issue";
import { formatWeekOf } from "@/lib/issue";

type MastheadProps = {
  issue: Issue;
};

export function Masthead({ issue }: MastheadProps) {
  const weekLabel = formatWeekOf(issue.weekOf);

  return (
    <header className="masthead animate-ink-in">
      <div className="masthead-meta">
        {issue.edition ? (
          <p className="meta-line">{issue.edition}</p>
        ) : (
          <span />
        )}
        <p className="meta-line meta-week">Week of {weekLabel}</p>
      </div>

      <h1 className="masthead-brand">{issue.title}</h1>

      {issue.tagline ? (
        <p className="masthead-tagline">{issue.tagline}</p>
      ) : null}

      <div className="rule-ornament" aria-hidden="true" />
    </header>
  );
}
