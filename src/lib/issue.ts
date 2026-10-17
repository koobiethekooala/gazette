import issueData from "../../content/issue.json";

/** Home index shows at most this many stories. */
export const MAX_HOME_ARTICLES = 25;

export type ArticleSection = {
  heading?: string;
  body: string;
};

export type Article = {
  id: string;
  headline: string;
  dek?: string;
  category?: string;
  byline?: string;
  featured?: boolean;
  /** Reserved for future full-article page templates (not used on home). */
  template?: string;
  body?: string;
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

/** Articles for the home broadsheet, capped at MAX_HOME_ARTICLES. */
export function getHomeArticles(issue: Issue = getIssue()): Article[] {
  return issue.articles.slice(0, MAX_HOME_ARTICLES);
}

export function getArticleById(id: string): Article | undefined {
  return getIssue().articles.find((article) => article.id === id);
}

export function getArticleText(article: Article): string {
  if (article.body?.trim()) return article.body.trim();
  if (article.sections?.length) {
    return article.sections
      .map((s) => [s.heading, s.body].filter(Boolean).join(". "))
      .join("\n\n");
  }
  return "";
}

export function getArticleExcerpt(article: Article, maxChars = 220): string {
  const text = getArticleText(article).replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= maxChars) return text;
  const sliced = text.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).trim()}…`;
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
