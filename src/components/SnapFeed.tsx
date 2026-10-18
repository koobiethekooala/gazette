"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { PublicationByline } from "@/components/PublicationByline";
import { triggerHaptic } from "@/lib/haptics";
import {
  formatMastheadDate,
  getArticleCover,
  getFeedSubtitle,
  getHomeArticles,
  getReadTimeMinutes,
  type Article,
  type Issue,
} from "@/lib/issue";
import {
  getReadArticleIds,
  READ_ARTICLES_EVENT,
} from "@/lib/readArticles";

type SnapFeedProps = {
  issue: Issue;
};

function filterUnread(articles: Article[]): Article[] {
  const readIds = getReadArticleIds();
  return articles.filter((article) => !readIds.has(article.id));
}

export function SnapFeed({ issue }: SnapFeedProps) {
  const allArticles = useMemo(() => getHomeArticles(issue), [issue]);
  // SSR / first paint: show full list; client sync hides read ones from localStorage.
  const [articles, setArticles] = useState<Article[]>(allArticles);
  const total = articles.length;
  const scrollerRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(1);
  const didMountHaptic = useRef(false);

  useEffect(() => {
    const syncUnread = () => {
      const next = filterUnread(allArticles);
      setArticles(next);
      setActiveIndex(1);
      if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
    };

    syncUnread();
    window.addEventListener(READ_ARTICLES_EVENT, syncUnread);
    window.addEventListener("storage", syncUnread);
    window.addEventListener("pageshow", syncUnread);
    window.addEventListener("focus", syncUnread);
    const onVisibility = () => {
      if (document.visibilityState === "visible") syncUnread();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener(READ_ARTICLES_EVENT, syncUnread);
      window.removeEventListener("storage", syncUnread);
      window.removeEventListener("pageshow", syncUnread);
      window.removeEventListener("focus", syncUnread);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [allArticles]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || total === 0) return;

    const updateActive = () => {
      const height = root.clientHeight;
      if (height <= 0) return;
      const next = Math.min(
        total,
        Math.max(1, Math.round(root.scrollTop / height) + 1),
      );
      setActiveIndex((prev) => (prev === next ? prev : next));
    };

    updateActive();
    root.addEventListener("scroll", updateActive, { passive: true });
    root.addEventListener("scrollend", updateActive);
    window.addEventListener("resize", updateActive);
    return () => {
      root.removeEventListener("scroll", updateActive);
      root.removeEventListener("scrollend", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [total, articles]);

  useEffect(() => {
    if (!didMountHaptic.current) {
      didMountHaptic.current = true;
      return;
    }
    triggerHaptic();
  }, [activeIndex]);

  return (
    <div className="feed-shell">
      <header
        className="feed-chrome"
        style={{ viewTransitionName: "site-chrome" }}
      >
        <div className="feed-chrome-brand">
          <BrandLogo title={issue.title} href="/" size="chrome" />
        </div>
      </header>

      <p className="feed-sticky-meta" aria-live="polite">
        <span className="feed-sticky-week">
          Week of {formatMastheadDate(issue.weekOf)}
        </span>
        {total > 0 ? (
          <span className="feed-sticky-count">
            <span className="feed-sticky-current">{activeIndex}</span>
            <span className="feed-sticky-sep">/</span>
            <span className="feed-sticky-total">{total}</span>
          </span>
        ) : null}
      </p>

      {allArticles.length === 0 ? (
        <p className="empty-issue feed-empty">
          No stories in this week’s issue yet.
        </p>
      ) : total === 0 ? (
        <p className="empty-issue feed-empty">You’re all caught up.</p>
      ) : (
        <section
          ref={scrollerRef}
          className="feed-scroller"
          aria-label={`${total} unread stories — swipe vertically`}
        >
          {articles.map((article, i) => {
            const index = i + 1;
            const subtitle = getFeedSubtitle(article, 200);
            const minutes = getReadTimeMinutes(article);
            const cover = getArticleCover(article);

            return (
              <article
                key={article.id}
                className={
                  cover ? "feed-slide feed-slide-has-media" : "feed-slide"
                }
                data-feed-slide
                data-feed-index={index}
              >
                {cover ? (
                  <div className="feed-slide-media" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover.src}
                      alt=""
                      className="feed-slide-img"
                      style={
                        cover.position
                          ? { objectPosition: cover.position }
                          : undefined
                      }
                      loading={i < 2 ? "eager" : "lazy"}
                      decoding="async"
                      draggable={false}
                    />
                  </div>
                ) : null}
                <Link
                  href={`/article/${article.id}`}
                  className="feed-slide-link"
                  aria-label={`Open article ${index}: ${article.headline}`}
                  transitionTypes={["nav-forward"]}
                  onClick={() => triggerHaptic()}
                >
                  <div className="feed-slide-copy">
                    {article.byline ? (
                      <PublicationByline
                        name={article.byline}
                        className="feed-slide-byline"
                      />
                    ) : null}
                    <h2 className="feed-slide-headline">{article.headline}</h2>
                    {subtitle ? (
                      <p className="feed-slide-subtitle">{subtitle}</p>
                    ) : null}

                    <div className="feed-slide-tags">
                      {article.category ? (
                        <span className="feed-tag feed-tag-category">
                          {article.category}
                        </span>
                      ) : null}
                      <span className="feed-tag feed-tag-read">
                        <Clock
                          className="feed-tag-icon"
                          aria-hidden="true"
                          strokeWidth={2}
                        />
                        {minutes} min read
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
