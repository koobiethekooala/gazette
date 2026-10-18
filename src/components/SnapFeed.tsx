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
  const slides = root.querySelectorAll<HTMLElement>("[data-feed-slide]");
  const target = slides[Math.max(0, index0)];
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  if (target) {
    root.scrollTop = target.offsetTop;
  } else {
    const height = root.clientHeight || window.innerHeight;
    root.scrollTop = Math.max(0, index0) * height;
  }
  root.style.scrollBehavior = prev;
}

/** Returns 0-based index to restore, or null if there is nothing saved. */
function resolveRestoreIndex(articles: Article[]): number | null {
  if (articles.length === 0) return null;
  const saved = loadFeedPosition();
  if (!saved) return null;

  const found = articles.findIndex((a) => a.id === saved.articleId);
  if (found >= 0) return found;

  // Marked as read — land on the vacated slot.
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
  const pendingScrollIndex = useRef<number | null>(null);
  const pendingClearSaved = useRef(false);
  const restoreTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearRestoreTimers() {
    for (const t of restoreTimers.current) clearTimeout(t);
    restoreTimers.current = [];
  }

  function scheduleScroll(index0: number, clearSaved: boolean) {
    const run = () => {
      const root = scrollerRef.current;
      if (!root) return;
      const count = root.querySelectorAll("[data-feed-slide]").length;
      if (count === 0) return;
      const clamped = Math.min(Math.max(0, index0), count - 1);
      scrollToSlide(root, clamped);
      setActiveIndex(clamped + 1);
    };

    clearRestoreTimers();
    run();
    requestAnimationFrame(run);
    // Re-apply after snap + view-transition settle (esp. iOS / Next VT).
    restoreTimers.current.push(
      setTimeout(run, 50),
      setTimeout(run, 200),
      setTimeout(() => {
        run();
        if (clearSaved) clearFeedPosition();
      }, 450),
    );
  }

  useEffect(() => () => clearRestoreTimers(), []);

  useEffect(() => {
    const applyList = (
      next: Article[],
      scrollTo: number | null,
      clearSaved: boolean,
    ) => {
      if (scrollTo !== null) {
        pendingScrollIndex.current = scrollTo;
        pendingClearSaved.current = clearSaved;
      }

      setArticles((prev) => {
        if (sameArticleList(prev, next)) {
          if (scrollTo !== null) {
            pendingScrollIndex.current = null;
            scheduleScroll(scrollTo, clearSaved);
          }
          return prev;
        }
        return next;
      });
    };

    const syncUnread = (restorePosition: boolean) => {
      const next = filterUnread(allArticles);

      if (restorePosition) {
        const index = resolveRestoreIndex(next);
        if (index === null) {
          applyList(next, null, false);
          return;
        }
        const saved = loadFeedPosition();
        const stillThere =
          saved != null && next.some((a) => a.id === saved.articleId);
        applyList(next, index, stillThere);
        return;
      }

      // Soft sync: only clamp if current slide index is now out of range.
      const root = scrollerRef.current;
      let scrollTo: number | null = null;
      if (root && next.length > 0) {
        const height = root.clientHeight || window.innerHeight;
        const current = Math.round(root.scrollTop / Math.max(1, height));
        if (current > next.length - 1) scrollTo = next.length - 1;
      }
      applyList(next, scrollTo, false);
    };

    syncUnread(true);

    const restoreSync = () => syncUnread(true);
    const softSync = () => syncUnread(false);

    window.addEventListener(READ_ARTICLES_EVENT, softSync);
    window.addEventListener("storage", softSync);
    window.addEventListener("pageshow", restoreSync);
    const onVisibility = () => {
      if (document.visibilityState === "visible") restoreSync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener(READ_ARTICLES_EVENT, softSync);
      window.removeEventListener("storage", softSync);
      window.removeEventListener("pageshow", restoreSync);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // scheduleScroll is stable enough for this effect's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allArticles]);

  useLayoutEffect(() => {
    if (pendingScrollIndex.current === null) return;
    const index0 = pendingScrollIndex.current;
    const clearSaved = pendingClearSaved.current;
    pendingScrollIndex.current = null;
    pendingClearSaved.current = false;

    if (articles.length === 0) {
      setActiveIndex(1);
      return;
    }

    scheduleScroll(index0, clearSaved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <BrandLogo
            title={issue.title}
            href="/"
            size="chrome"
            onClick={(event) => {
              // Already on the feed — stay put and ease back to the first slide.
              event.preventDefault();
              clearFeedPosition();
              const root = scrollerRef.current;
              if (root) {
                const reduceMotion = window.matchMedia(
                  "(prefers-reduced-motion: reduce)",
                ).matches;
                root.scrollTo({
                  top: 0,
                  behavior: reduceMotion ? "auto" : "smooth",
                });
              }
              setActiveIndex(1);
              triggerHaptic();
            }}
          />
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
                  onPointerDown={() => saveFeedPosition(article.id, i)}
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
