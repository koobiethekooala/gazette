import type { Article } from "@/lib/issue";
import { getArticleParagraphs } from "@/lib/issue";

type ArticleBlockProps = {
  article: Article;
  featured?: boolean;
};

export function ArticleBlock({ article, featured = false }: ArticleBlockProps) {
  const paragraphs = getArticleParagraphs(article);
  const hasSections = Boolean(article.sections?.length);

  return (
    <article
      id={article.id}
      className={featured ? "article article-featured animate-rise" : "article animate-rise"}
      style={{ animationDelay: featured ? "120ms" : undefined }}
    >
      {article.category ? (
        <p className="article-category">{article.category}</p>
      ) : null}

      <h2 className="article-headline">{article.headline}</h2>

      {article.dek ? <p className="article-dek">{article.dek}</p> : null}

      {article.byline ? (
        <p className="article-byline">
          <span className="by-label">By</span> {article.byline}
        </p>
      ) : null}

      {paragraphs.length > 0 ? (
        <div
          className={
            featured ? "article-body article-body-columns" : "article-body"
          }
        >
          {paragraphs.map((paragraph, index) => (
            <p key={`${article.id}-p-${index}`}>{paragraph}</p>
          ))}
        </div>
      ) : null}

      {hasSections
        ? article.sections!.map((section, index) => (
            <section
              key={`${article.id}-s-${index}`}
              className="article-section"
            >
              {section.heading ? (
                <h3 className="section-heading">{section.heading}</h3>
              ) : null}
              <div className="article-body">
                {section.body
                  .split(/\n\s*\n/)
                  .map((p) => p.trim())
                  .filter(Boolean)
                  .map((paragraph, pIndex) => (
                    <p key={`${article.id}-s-${index}-p-${pIndex}`}>
                      {paragraph}
                    </p>
                  ))}
              </div>
            </section>
          ))
        : null}
    </article>
  );
}
