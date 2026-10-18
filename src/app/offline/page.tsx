import Link from "next/link";

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "2rem",
        textAlign: "center",
        background: "#0c0b0a",
        color: "#f5f0e8",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon-192.png"
        alt=""
        width={72}
        height={72}
        style={{ borderRadius: "1rem" }}
      />
      <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>
        You’re offline
      </h1>
      <p style={{ margin: 0, maxWidth: "22rem", opacity: 0.75, lineHeight: 1.45 }}>
        This page isn’t available offline yet. Reconnect, or go back to stories
        you’ve already opened.
      </p>
      <Link
        href="/"
        style={{
          marginTop: "0.5rem",
          color: "#0c0b0a",
          background: "#f5f0e8",
          padding: "0.7rem 1.2rem",
          borderRadius: "0.65rem",
          textDecoration: "none",
          fontWeight: 650,
          fontSize: "0.85rem",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        Back to Gazette
      </Link>
    </main>
  );
}
