import type { Article } from "@/lib/issue";
import { getArticleExcerpt } from "@/lib/issue";

type StoryCellProps = {
  article: Article;
  index: number;
};

export function StoryCell({ article, index }: StoryCellProps) {
  const excerpt = getArticleExcerpt(article);
  const subtitle = article.dek || article.category;

  return (
    <article
      className="story-cell"
      id={article.id}
      data-template={article.template || undefined}
    >
      <div className="story-index" aria-hidden="true">
        {index}
      </div>
      <div className="story-copy">
        <h2 className="story-title">{article.headline}</h2>
        {subtitle ? <p className="story-dek">{subtitle}</p> : null}
        {excerpt ? <p className="story-excerpt">{excerpt}</p> : null}
      </div>
    </article>
  );
}
