"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { PublicationByline } from "@/components/PublicationByline";
import { triggerHaptic } from "@/lib/haptics";
import {
  clearFeedPosition,
  loadFeedPosition,
  saveFeedPosition,
} from "@/lib/feedPosition";
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

function sameArticleList(a: Article[], b: Article[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((article, i) => article.id === b[i]?.id);
}

function scrollToSlide(root: HTMLElement, index0: number) {
  const height = root.clientHeight || window.innerHeight;
  if (height <= 0) return;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  root.scrollTop = Math.max(0, index0) * height;
  root.style.scrollBehavior = prev;
}

function resolveRestoreIndex(articles: Article[]): number {
  if (articles.length === 0) return 0;
  const saved = loadFeedPosition();
  if (!saved) return 0;

  const found = articles.findIndex((a) => a.id === saved.articleId);
  if (found >= 0) {
    // Still in the feed — return to that slide.
    return found;
  }

  // Marked as read (removed) — land on the slot it vacated.
  clearFeedPosition();
  return Math.min(saved.index, articles.length - 1);
}

export function SnapFeed({ issue }: SnapFeedProps) {
  const allArticles = useMemo(() => getHomeArticles(issue), [issue]);
  const [articles, setArticles] = useState<Article[]>(allArticles);
  const total = articles.length;
  const scrollerRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(1);
  const didMountHaptic = useRef(false);
  /** When set, layout effect scrolls to this 0-based index after `articles` updates. */
  const pendingScrollIndex = useRef<number | null>(null);

  useEffect(() => {
    const applyList = (next: Article[], scrollTo: number | null) => {
      if (scrollTo !== null) pendingScrollIndex.current = scrollTo;
      setArticles((prev) => {
        if (sameArticleList(prev, next)) {
          // List unchanged (e.g. nothing read yet) — still apply pending scroll.
          if (scrollTo !== null) {
            const index0 = scrollTo;
            pendingScrollIndex.current = null;
            requestAnimationFrame(() => {
              const root = scrollerRef.current;
              if (!root || next.length === 0) return;
              const clamped = Math.min(index0, next.length - 1);
              scrollToSlide(root, clamped);
              setActiveIndex(clamped + 1);
            });
          }
          return prev;
        }
        return next;
      });
    };

    const syncUnread = (restorePosition: boolean) => {
      const next = filterUnread(allArticles);
      if (restorePosition) {
        applyList(next, resolveRestoreIndex(next));
        return;
      }

      // Soft sync (focus / storage): keep current scroll unless the list shrank under us.
      const root = scrollerRef.current;
      let scrollTo: number | null = null;
      if (root && next.length > 0) {
        const height = root.clientHeight || window.innerHeight;
        const current = Math.round(root.scrollTop / Math.max(1, height));
        if (current > next.length - 1) scrollTo = next.length - 1;
      }
      applyList(next, scrollTo);
    };

    syncUnread(true);

    const softSync = () => syncUnread(false);
    window.addEventListener(READ_ARTICLES_EVENT, softSync);
    window.addEventListener("storage", softSync);
    window.addEventListener("pageshow", softSync);
    window.addEventListener("focus", softSync);
    const onVisibility = () => {
      if (document.visibilityState === "visible") softSync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener(READ_ARTICLES_EVENT, softSync);
      window.removeEventListener("storage", softSync);
      window.removeEventListener("pageshow", softSync);
      window.removeEventListener("focus", softSync);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [allArticles]);

  useLayoutEffect(() => {
    if (pendingScrollIndex.current === null) return;
    const index0 = pendingScrollIndex.current;
    pendingScrollIndex.current = null;

    const root = scrollerRef.current;
    if (!root || articles.length === 0) {
      setActiveIndex(1);
      return;
    }

    const clamped = Math.min(index0, articles.length - 1);
    scrollToSlide(root, clamped);
    setActiveIndex(clamped + 1);
  }, [articles]);

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
                  onClick={() => {
                    saveFeedPosition(article.id, i);
                    triggerHaptic();
                  }}
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
