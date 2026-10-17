"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  formatMastheadDate,
  getArticleExcerpt,
  getHomeArticles,
  getReadTimeMinutes,
  type Issue,
} from "@/lib/issue";

type SnapFeedProps = {
  issue: Issue;
};

export function SnapFeed({ issue }: SnapFeedProps) {
  const articles = getHomeArticles(issue);
  const total = articles.length;
  const scrollerRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(1);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || total === 0) return;

    const slides = Array.from(
      root.querySelectorAll<HTMLElement>("[data-feed-slide]"),
    );
    if (slides.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { index: number; ratio: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const raw = entry.target.getAttribute("data-feed-index");
          const index = raw ? Number(raw) : NaN;
          if (!Number.isFinite(index)) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { index, ratio: entry.intersectionRatio };
          }
        }
        if (best) setActiveIndex(best.index);
      },
      {
        root,
        threshold: [0.35, 0.55, 0.75],
      },
    );

    for (const slide of slides) observer.observe(slide);
    return () => observer.disconnect();
  }, [total]);

  return (
    <div className="feed-shell">
      <header className="feed-chrome">
        <div className="feed-chrome-brand">
          <p className="feed-title">{issue.title}</p>
          <p className="feed-week">Week of {formatMastheadDate(issue.weekOf)}</p>
        </div>
        {total > 0 ? (
          <p className="feed-sticky-count" aria-live="polite">
            <span className="feed-sticky-current">{activeIndex}</span>
            <span className="feed-sticky-sep">/</span>
            <span className="feed-sticky-total">{total}</span>
          </p>
        ) : null}
      </header>

      {total === 0 ? (
        <p className="empty-issue feed-empty">
          No stories in this week’s issue yet.
        </p>
      ) : (
        <section
          ref={scrollerRef}
          className="feed-scroller"
          aria-label={`${total} stories — swipe vertically`}
        >
          {articles.map((article, i) => {
            const index = i + 1;
            const subtitle = article.dek || getArticleExcerpt(article, 180);
            const minutes = getReadTimeMinutes(article);

            return (
              <article
                key={article.id}
                className="feed-slide"
                data-feed-slide
                data-feed-index={index}
              >
                <Link
                  href={`/article/${article.id}`}
                  className="feed-slide-link"
                  aria-label={`Open article ${index}: ${article.headline}`}
                >
                  <div className="feed-slide-copy">
                    <p className="feed-slide-index" aria-hidden="true">
                      {index}
                    </p>

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

                    <span className="feed-slide-cta">Tap to read →</span>
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
