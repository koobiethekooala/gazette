import Image from "next/image";
import {
  getArticleBlocks,
  isLocalImageSrc,
  type Article,
  type ArticleBlock,
} from "@/lib/issue";

type ArticleBodyProps = {
  article: Article;
};

function BlockView({ block }: { block: ArticleBlock }) {
  if (block.type === "h2" || block.type === "h3" || block.type === "h4") {
    const Tag = block.type;
    return (
      <Tag className={`article-heading article-heading-${block.type}`}>
        {block.text}
      </Tag>
    );
  }

  if (block.type === "image") {
    const alt = block.alt?.trim() || "";
    const local = isLocalImageSrc(block.src);

    return (
      <figure className="article-figure">
        {local ? (
          <Image
            src={block.src}
            alt={alt}
            width={1200}
            height={750}
            className="article-figure-img"
            sizes="(max-width: 42rem) 100vw, 42rem"
          />
        ) : (
          // Remote newsletter CDNs vary; plain img avoids remotePatterns churn.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={block.src}
            alt={alt}
            className="article-figure-img"
            loading="lazy"
            decoding="async"
          />
        )}
        {block.caption || block.credit ? (
          <figcaption className="article-figure-caption">
            {block.caption ? <span>{block.caption}</span> : null}
            {block.credit ? (
              <span className="article-figure-credit">{block.credit}</span>
            ) : null}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return <p>{block.text}</p>;
}

export function ArticleBody({ article }: ArticleBodyProps) {
  const blocks = getArticleBlocks(article);
  if (blocks.length === 0) return null;

  return (
    <div className="article-page-body">
      {blocks.map((block, index) => (
        <BlockView key={`${article.id}-${index}`} block={block} />
      ))}
    </div>
  );
}
