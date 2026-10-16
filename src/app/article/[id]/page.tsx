import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getArticleById,
  getArticleText,
  getIssue,
} from "@/lib/issue";

type ArticlePageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getIssue().articles.map((article) => ({ id: article.id }));
}

async function ArticleContent({ params }: ArticlePageProps) {
  const { id } = await params;
  const article = getArticleById(id);
  if (!article) notFound();

  const issue = getIssue();
  const paragraphs = getArticleText(article)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="paper-page article-page">
      <p className="article-back">
        <Link href="/">← {issue.title}</Link>
      </p>
      {article.category ? (
        <p className="article-page-category">{article.category}</p>
      ) : null}
      <h1 className="article-page-title">{article.headline}</h1>
      {article.dek ? <p className="article-page-dek">{article.dek}</p> : null}
      {article.byline ? (
        <p className="article-page-byline">By {article.byline}</p>
      ) : null}
      <div className="article-page-body">
        {paragraphs.map((paragraph, index) => (
          <p key={`${article.id}-${index}`}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

export default function ArticlePage({ params }: ArticlePageProps) {
  return (
    <div className="paper-shell">
      <div className="paper-grain" aria-hidden="true" />
      <Suspense fallback={<div className="paper-page article-page">Loading…</div>}>
        <ArticleContent params={params} />
      </Suspense>
    </div>
  );
}
