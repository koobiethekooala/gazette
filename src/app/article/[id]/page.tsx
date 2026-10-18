import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleBody } from "@/components/ArticleBody";
import { BrandLogo } from "@/components/BrandLogo";
import { MarkAsReadButton } from "@/components/MarkAsReadButton";
import { NavTransition } from "@/components/NavTransition";
import { PublicationByline } from "@/components/PublicationByline";
import { ReaderBack } from "@/components/ReaderBack";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getArticleById, getIssue } from "@/lib/issue";

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

  return (
    <>
      <ReaderBack />
      <ThemeToggle />

      <header
        className="reader-chrome"
        style={{ viewTransitionName: "site-chrome" }}
      >
        <div className="reader-chrome-brand">
          <BrandLogo title={issue.title} href="/" size="chrome" />
        </div>
      </header>

      <div className="paper-page article-page">
        <h1 className="article-page-title">{article.headline}</h1>
        {article.dek ? <p className="article-page-dek">{article.dek}</p> : null}
        {article.byline ? (
          <PublicationByline name={article.byline} />
        ) : null}
        <ArticleBody article={article} />
        <MarkAsReadButton articleId={article.id} />
      </div>
    </>
  );
}

export default function ArticlePage({ params }: ArticlePageProps) {
  return (
    <NavTransition>
      <div className="paper-shell">
        <div className="paper-grain" aria-hidden="true" />
        <Suspense
          fallback={<div className="paper-page article-page">Loading…</div>}
        >
          <ArticleContent params={params} />
        </Suspense>
      </div>
    </NavTransition>
  );
}
