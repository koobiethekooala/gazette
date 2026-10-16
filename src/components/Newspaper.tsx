import { Masthead } from "@/components/Masthead";
import { StoryCell } from "@/components/StoryCell";
import { getHomeArticles, type Issue } from "@/lib/issue";

type NewspaperProps = {
  issue: Issue;
};

export function Newspaper({ issue }: NewspaperProps) {
  const articles = getHomeArticles(issue);

  return (
    <div className="paper-shell">
      <div className="paper-grain" aria-hidden="true" />
      <div className="paper-page">
        <Masthead issue={issue} />
        <div className="masthead-rule" aria-hidden="true" />

        {articles.length === 0 ? (
          <p className="empty-issue">No stories in this week’s issue yet.</p>
        ) : (
          <section
            className="broadsheet-grid"
            aria-label={`${articles.length} stories this week`}
          >
            {articles.map((article, i) => (
              <StoryCell key={article.id} article={article} index={i + 1} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
