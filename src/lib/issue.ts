import issueData from "../../content/issue.json";

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

export function getArticleParagraphs(article: Article): string[] {
  if (article.body?.trim()) {
    return article.body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [];
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
