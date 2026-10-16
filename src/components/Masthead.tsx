import type { Issue } from "@/lib/issue";
import { formatMastheadDate } from "@/lib/issue";

type MastheadProps = {
  issue: Issue;
};

export function Masthead({ issue }: MastheadProps) {
  return (
    <header className="masthead">
      <h1 className="masthead-brand">{issue.title}</h1>
      <p className="masthead-date">
        {issue.edition ? `${issue.edition} · ` : null}
        Week of {formatMastheadDate(issue.weekOf)}
      </p>
    </header>
  );
}
