import { ArticleBlock } from "@/components/ArticleBlock";
import { Masthead } from "@/components/Masthead";
import type { Issue } from "@/lib/issue";

type NewspaperProps = {
  issue: Issue;
};

export function Newspaper({ issue }: NewspaperProps) {
  const featured =
    issue.articles.find((article) => article.featured) ?? issue.articles[0];
  const rest = issue.articles.filter((article) => article.id !== featured?.id);

  return (
    <div className="paper-shell">
      <div className="paper-grain" aria-hidden="true" />
      <div className="paper-page">
        <Masthead issue={issue} />

        {featured ? <ArticleBlock article={featured} featured /> : null}

        {rest.length > 0 ? (
          <section className="issue-rest" aria-label="More in this issue">
            <div className="rule-thin" aria-hidden="true" />
            <div className="article-grid">
              {rest.map((article, index) => (
                <div
                  key={article.id}
                  className="article-grid-item"
                  style={{ animationDelay: `${180 + index * 70}ms` }}
                >
                  <ArticleBlock article={article} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <footer className="issue-footer">
          <div className="rule-thin" aria-hidden="true" />
          <p>
            End of the week’s edition
            {issue.updatedAt
              ? ` · updated ${new Date(issue.updatedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}`
              : null}
          </p>
        </footer>
      </div>
    </div>
  );
}
