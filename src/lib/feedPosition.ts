/** Remember which feed slide was open before navigating to the reader. */

const STORAGE_KEY = "gazette-feed-position";

export type FeedPosition = {
  /** Stable article id of the slide that was opened. */
  articleId: string;
  /** 0-based index in the unread list at save time. */
  index: number;
};

export function saveFeedPosition(articleId: string, index: number): void {
  if (typeof window === "undefined" || !articleId) return;
  try {
    const payload: FeedPosition = {
      articleId,
      index: Math.max(0, index),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* private mode */
  }
}

export function loadFeedPosition(): FeedPosition | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FeedPosition>;
    if (!parsed?.articleId || typeof parsed.articleId !== "string") return null;
    const index =
      typeof parsed.index === "number" && Number.isFinite(parsed.index)
        ? Math.max(0, Math.floor(parsed.index))
        : 0;
    return { articleId: parsed.articleId, index };
  } catch {
    return null;
  }
}

export function clearFeedPosition(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
