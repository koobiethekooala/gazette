import Link from "next/link";
import type { Article } from "@/lib/issue";
import { getArticleExcerpt } from "@/lib/issue";
import { getCellShape, getExcerptLength } from "@/lib/layout";

type StoryCellProps = {
  article: Article;
  index: number;
};

export function StoryCell({ article, index }: StoryCellProps) {
  const shape = getCellShape(index);
  const excerpt = getArticleExcerpt(article, getExcerptLength(shape));
  const subtitle = article.dek || article.category;

  return (
    <article
      className={`story-cell story-cell--${shape}`}
      id={article.id}
      data-template={article.template || undefined}
      data-shape={shape}
    >
      <div className="story-index" aria-hidden="true">
        {index}
      </div>
      <div className="story-copy">
        <h2 className="story-title">{article.headline}</h2>
        {subtitle ? <p className="story-dek">{subtitle}</p> : null}
        {excerpt ? <p className="story-excerpt">{excerpt}</p> : null}
        <Link href={`/article/${article.id}`} className="story-open">
          Open full article
        </Link>
      </div>
    </article>
  );
}
