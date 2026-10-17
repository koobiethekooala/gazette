import Link from "next/link";
import { ViewToggle } from "@/components/ViewToggle";
import {
  formatMastheadDate,
  getArticleExcerpt,
  type Issue,
} from "@/lib/issue";
import { getHomeArticles } from "@/lib/issue";

type SnapFeedProps = {
  issue: Issue;
};

export function SnapFeed({ issue }: SnapFeedProps) {
  const articles = getHomeArticles(issue);
  const total = articles.length;

  return (
    <div className="feed-shell">
      <header className="feed-chrome">
        <div className="feed-chrome-brand">
          <p className="feed-title">{issue.title}</p>
          <p className="feed-week">Week of {formatMastheadDate(issue.weekOf)}</p>
        </div>
        <ViewToggle active="feed" />
      </header>

      {total === 0 ? (
        <p className="empty-issue feed-empty">No stories in this week’s issue yet.</p>
      ) : (
        <section
          className="feed-scroller"
          aria-label={`${total} stories — swipe vertically`}
        >
          {articles.map((article, i) => {
            const index = i + 1;
            const subtitle = article.dek || article.category;
            const excerpt = getArticleExcerpt(article, 180);

            return (
              <article key={article.id} className="feed-slide">
                <Link
                  href={`/article/${article.id}`}
                  className="feed-slide-link"
                  aria-label={`Open article ${index}: ${article.headline}`}
                >
                  <div className="feed-slide-meta">
                    <span className="feed-slide-count">
                      {index} / {total}
                    </span>
                    {article.category ? (
                      <span className="feed-slide-category">
                        {article.category}
                      </span>
                    ) : null}
                  </div>

                  <p className="feed-slide-index" aria-hidden="true">
                    {index}
                  </p>

                  <h2 className="feed-slide-headline">{article.headline}</h2>
                  {subtitle ? (
                    <p className="feed-slide-dek">{subtitle}</p>
                  ) : null}
                  {excerpt ? (
                    <p className="feed-slide-excerpt">{excerpt}</p>
                  ) : null}

                  <span className="feed-slide-cta">Tap to read →</span>
                </Link>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
