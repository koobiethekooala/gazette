/** Persist read state by stable article `id` slug (not feed position). */

const STORAGE_KEY = "gazette-read-articles";

type ReadStore = {
  /** Map of article id → ISO timestamp when marked read. */
  read: Record<string, string>;
};

function emptyStore(): ReadStore {
  return { read: {} };
}

function readStore(): ReadStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<ReadStore>;
    if (!parsed || typeof parsed.read !== "object" || parsed.read === null) {
      return emptyStore();
    }
    return { read: { ...parsed.read } };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: ReadStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota / private mode */
  }
}

export function isArticleRead(articleId: string): boolean {
  if (!articleId) return false;
  return Boolean(readStore().read[articleId]);
}

export function markArticleRead(articleId: string): void {
  if (!articleId) return;
  const store = readStore();
  store.read[articleId] = new Date().toISOString();
  writeStore(store);
}

export function unmarkArticleRead(articleId: string): void {
  if (!articleId) return;
  const store = readStore();
  delete store.read[articleId];
  writeStore(store);
}
