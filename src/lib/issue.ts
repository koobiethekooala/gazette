import issueData from "../../content/issue.json";

/** Preferred article body: ordered blocks (maps cleanly from newsletter HTML). */
export type ParagraphBlock = {
  type: "p";
  text: string;
};

export type HeadingBlock = {
  type: "h2" | "h3" | "h4";
  text: string;
};

export type ImageBlock = {
  type: "image";
  /**
   * Remote `https://…` URL, or a path under `public/`
   * (e.g. `/images/articles/harbor-ferry.png`).
   */
  src: string;
  alt?: string;
  caption?: string;
  credit?: string;
};

export type ArticleBlock = ParagraphBlock | HeadingBlock | ImageBlock;

export type ArticleSection = {
  heading?: string;
  body: string;
};

/**
 * Portrait lead image for the home snap feed (shown full-bleed, object-fit: cover).
 * Falls back to the first image block of the article when omitted.
 */
export type ArticleCover = {
  /** Remote `https://…` URL or a path under `public/` (portrait ~9:16 works best). */
  src: string;
  alt?: string;
  credit?: string;
  /** CSS object-position for the crop, e.g. "center 30%". Default: "center 35%". */
  position?: string;
};

export type Article = {
  id: string;
  headline: string;
  dek?: string;
  /**
   * Original 1–2 sentence summary of the whole article (~120–190 chars, no
   * cliffhangers). Shown under the title on the swipe feed and used as the
   * meta description. Falls back to the first paragraph / dek when omitted.
   */
  summary?: string;
  category?: string;
  /** Publication name shown with a small avatar. */
  byline?: string;
  featured?: boolean;
  /** Reserved for future full-article page templates (not used on home). */
  template?: string;
  /** Lead image for the home feed slide (falls back to the first image block). */
  cover?: ArticleCover;
  /** Preferred rich body. */
  blocks?: ArticleBlock[];
  /** Legacy plain text; paragraphs separated by blank lines. */
  body?: string;
  /** Legacy section list; converted to h2 + paragraphs. */
  sections?: ArticleSection[];
};

export type Issue = {
  title: string;
  weekOf: string;
  edition?: string;
  tagline?: string;
  updatedAt?: string;
  articles: Article[];
};

export function getIssue(): Issue {
  return issueData as Issue;
}

/** Articles for the home snap feed — full issue order, no cap. */
export function getHomeArticles(issue: Issue = getIssue()): Article[] {
  return issue.articles;
}

export function getArticleById(id: string): Article | undefined {
  return getIssue().articles.find((article) => article.id === id);
}

function paragraphsFromText(text: string): ParagraphBlock[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({ type: "p" as const, text: p }));
}

/** Normalize any article shape into renderable blocks. */
export function getArticleBlocks(article: Article): ArticleBlock[] {
  if (article.blocks?.length) {
    return article.blocks.filter((block) => {
      if (block.type === "image") return Boolean(block.src?.trim());
      return Boolean(block.text?.trim());
    });
  }

  if (article.sections?.length) {
    const blocks: ArticleBlock[] = [];
    for (const section of article.sections) {
      if (section.heading?.trim()) {
        blocks.push({ type: "h2", text: section.heading.trim() });
      }
      blocks.push(...paragraphsFromText(section.body ?? ""));
    }
    return blocks;
  }

  if (article.body?.trim()) {
    return paragraphsFromText(article.body);
  }

  return [];
}

export function getArticleText(article: Article): string {
  const parts = getArticleBlocks(article)
    .map((block) => {
      if (block.type === "image") {
        return [block.alt, block.caption, block.credit]
          .filter(Boolean)
          .join(". ");
      }
      return block.text;
    })
    .map((t) => t.trim())
    .filter(Boolean);
  return parts.join("\n\n");
}

function truncateAtWord(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const sliced = text.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).trim()}…`;
}

export function getArticleExcerpt(article: Article, maxChars = 220): string {
  const text = getArticleText(article).replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= maxChars) return text;
  const sliced = text.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).trim()}…`;
}

/** Lead image for the feed: explicit `cover`, else the first image block. */
export function getArticleCover(article: Article): ArticleCover | null {
  if (article.cover?.src?.trim()) return article.cover;
  const first = getArticleBlocks(article).find(
    (block): block is ImageBlock => block.type === "image",
  );
  return first ? { src: first.src, alt: first.alt, credit: first.credit } : null;
}

/**
 * Short teaser for a feed slide: the article's `summary` when present, else
 * the first real paragraph (skips images, bullets and very short lines such
 * as "Key takeaways"), else the dek.
 */
export function getFeedSubtitle(article: Article, maxChars = 200): string {
  const summary = article.summary?.replace(/\s+/g, " ").trim();
  if (summary) return truncateAtWord(summary, maxChars);
  const lead = getArticleBlocks(article).find(
    (block) =>
      block.type === "p" &&
      block.text.trim().length >= 60 &&
      !/^[•\-–—\[]/.test(block.text.trim()) &&
      !/^https?:\/\//.test(block.text.trim()),
  );
  const text = (lead && lead.type === "p" ? lead.text : article.dek ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return truncateAtWord(text, maxChars);
}

/** Meta description: `summary`, else the dek, else a short body excerpt. */
export function getArticleDescription(article: Article): string {
  const summary = article.summary?.replace(/\s+/g, " ").trim();
  if (summary) return summary;
  const dek = article.dek?.replace(/\s+/g, " ").trim();
  return dek || getArticleExcerpt(article, 200);
}

/** Rough reading time at ~200 wpm; minimum 1 minute. */
export function getReadTimeMinutes(article: Article): number {
  const words = getArticleText(article).trim().split(/\s+/).filter(Boolean)
    .length;
  return Math.max(1, Math.round(words / 200));
}

export function formatWeekOf(weekOf: string): string {
  const date = new Date(`${weekOf}T12:00:00`);
  if (Number.isNaN(date.getTime())) return weekOf;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMastheadDate(weekOf: string): string {
  const date = new Date(`${weekOf}T12:00:00`);
  if (Number.isNaN(date.getTime())) return weekOf.toUpperCase();
  return date
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

/** Local public path vs remote URL. */
export function isLocalImageSrc(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//");
}
