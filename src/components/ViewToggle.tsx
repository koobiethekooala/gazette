import Link from "next/link";

type ViewToggleProps = {
  active: "broadsheet" | "feed";
};

export function ViewToggle({ active }: ViewToggleProps) {
  return (
    <nav className="view-toggle" aria-label="Listing style">
      <Link
        href="/"
        className={active === "broadsheet" ? "is-active" : undefined}
        aria-current={active === "broadsheet" ? "page" : undefined}
      >
        Broadsheet
      </Link>
      <Link
        href="/feed"
        className={active === "feed" ? "is-active" : undefined}
        aria-current={active === "feed" ? "page" : undefined}
      >
        Feed
      </Link>
    </nav>
  );
}
