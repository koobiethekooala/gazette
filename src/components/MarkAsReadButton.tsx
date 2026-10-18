"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { triggerHaptic } from "@/lib/haptics";
import {
  isArticleRead,
  markArticleRead,
  unmarkArticleRead,
} from "@/lib/readArticles";

type MarkAsReadButtonProps = {
  /** Stable article slug from issue.json (`article.id`), never feed index. */
  articleId: string;
};

export function MarkAsReadButton({ articleId }: MarkAsReadButtonProps) {
  const [read, setRead] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRead(isArticleRead(articleId));
    setReady(true);
  }, [articleId]);

  function toggle() {
    triggerHaptic();
    if (read) {
      unmarkArticleRead(articleId);
      setRead(false);
    } else {
      markArticleRead(articleId);
      setRead(true);
    }
  }

  return (
    <div className="article-read-actions">
      <button
        type="button"
        className={
          read ? "article-read-button article-read-button-done" : "article-read-button"
        }
        onClick={toggle}
        aria-pressed={read}
        disabled={!ready}
      >
        {read ? (
          <>
            <Check
              className="article-read-button-icon"
              aria-hidden="true"
              strokeWidth={2.25}
            />
            Marked as read
          </>
        ) : (
          "Mark as read"
        )}
      </button>
    </div>
  );
}
