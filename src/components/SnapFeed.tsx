"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { PublicationByline } from "@/components/PublicationByline";
import { triggerHaptic } from "@/lib/haptics";
import {
  formatMastheadDate,
  getArticleCover,
  getFeedSubtitle,
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
  const didMountHaptic = useRef(false);

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

  // Soft tick when the snap settles on a new slide
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
            // First real paragraph (not image alt text); falls back to dek.
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
                    {/* Plain img: covers are local files or arbitrary CDN hosts. */}
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
