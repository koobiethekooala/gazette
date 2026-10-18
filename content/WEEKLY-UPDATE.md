# Weekly content update (for agents)

This file is the source of truth for publishing a new Gazette week. Edit JSON + optional images; do not add a CMS, database, or auth.

## What to change

| Path | Purpose |
|------|---------|
| `content/issue.json` | Entire weekly edition (masthead + articles) |
| `public/images/articles/` | Local article images referenced as `/images/articles/…` |

After editing, run `npm run build` (or rely on the running `npm run dev`) and open `/` plus one `/article/[id]` that uses images/headings.

## Issue fields

```json
{
  "title": "The Gazette",
  "weekOf": "2026-10-20",
  "edition": "Vol. XII · No. 42",
  "tagline": "Optional — unused in the current UI",
  "updatedAt": "2026-10-20T18:00:00.000Z",
  "articles": []
}
```

- `weekOf`: ISO date (`YYYY-MM-DD`) for the week being covered. Shown on the feed chrome.
- `articles`: ordered list; the home snap feed shows every article in array order.

## Article fields

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | URL slug: `/article/{id}` — kebab-case, stable |
| `headline` | yes | Feed + reader title |
| `dek` | no | One-line deck under the headline |
| `category` | no | Pill on feed + reader (e.g. `City`) |
| `byline` | no | **Publication name**, not a person (avatar initials derive from it) |
| `blocks` | preferred | Ordered body (paragraphs, headings, images) |
| `body` | legacy | Plain text; blank line = new paragraph |
| `sections` | legacy | `{ "heading", "body" }` → becomes `h2` + paragraphs |

Prefer **`blocks`**. If `blocks` is present it wins; otherwise `sections`, then `body`.

## Block types

### Paragraph

```json
{ "type": "p", "text": "Plain text paragraph. No HTML tags." }
```

### Headings (three sizes)

```json
{ "type": "h2", "text": "Section title" }
{ "type": "h3", "text": "Subsection" }
{ "type": "h4", "text": "Label / kicker" }
```

Use `h2` for major sections, `h3` for subsections, `h4` for small labels. Do not emit `h1` in blocks — the article `headline` is already the page `h1`.

### Image (local or remote)

**Local** (file under `public/`):

```json
{
  "type": "image",
  "src": "/images/articles/harbor-ferry.png",
  "alt": "Night ferry at the pier",
  "caption": "Optional caption under the image.",
  "credit": "Optional credit line"
}
```

1. Save the file to `public/images/articles/your-file.jpg` (or `.png` / `.webp`).
2. Set `src` to the public URL path starting with `/images/articles/…`.

**Remote** (newsletter / CDN HTTPS URL):

```json
{
  "type": "image",
  "src": "https://example.com/path/to/photo.jpg",
  "alt": "Description",
  "caption": "Optional",
  "credit": "Optional"
}
```

Remote images render with a plain `<img>` so arbitrary newsletter hosts work without Next image host config. Prefer HTTPS.

## Porting newsletter HTML → `blocks`

Work top-to-bottom through the newsletter body (skip the email chrome, unsubscribe footer, and share buttons).

| HTML | JSON block |
|------|------------|
| `<p>…</p>` | `{ "type": "p", "text": "…" }` |
| `<h2>…</h2>` | `{ "type": "h2", "text": "…" }` |
| `<h3>…</h3>` | `{ "type": "h3", "text": "…" }` |
| `<h4>…</h4>` or bold mini-heads | `{ "type": "h4", "text": "…" }` |
| `<img src alt>` | `{ "type": "image", "src", "alt" }` |
| `<figure>` + `<figcaption>` | image block; put figcaption in `caption` |
| `<ul>/<ol>` | one `p` per item, or a single `p` with short sentences |
| `<a href>` | keep **visible link text only** inside `text` (no raw HTML) |
| `<strong>` / `<em>` | plain text (drop tags) |
| `<hr>` | skip (spacing comes from block margins) |
| Nested tables / buttons | skip or collapse to a short `p` |

Rules of thumb:

1. **One block ≈ one visual unit** (one paragraph, one heading, one image).
2. **Strip HTML** — `text` is plain UTF-8 only.
3. **Images:** if the `src` is already HTTPS, paste it. If the image is an attachment/CID, download it into `public/images/articles/` and use a local `/images/articles/…` path.
4. **Headline / dek / byline** come from the newsletter header, not from body `h1`s.
5. Keep stories **short enough for a phone reader**; split a long newsletter into multiple articles when it has clear story breaks.

### Minimal ported article

```json
{
  "id": "example-story",
  "headline": "Example headline from the newsletter",
  "dek": "One-line summary.",
  "category": "City",
  "byline": "Harbor Herald",
  "blocks": [
    {
      "type": "image",
      "src": "/images/articles/harbor-ferry.png",
      "alt": "Pier at dusk",
      "caption": "Optional caption."
    },
    { "type": "p", "text": "Lead paragraph." },
    { "type": "h2", "text": "What changed" },
    { "type": "p", "text": "Supporting detail." },
    { "type": "h3", "text": "For residents" },
    { "type": "p", "text": "More detail." }
  ]
}
```

## New-week checklist

1. Copy last week’s `content/issue.json` (or clear `articles` and start fresh).
2. Set `weekOf`, `edition`, `updatedAt`.
3. For each newsletter story: choose `id`, fill metadata, port body to `blocks`.
4. Drop local images into `public/images/articles/` when not using remote URLs.
5. Put the lead story first in `articles` (feed order = array order).
6. Smoke-check `/` and a couple of article URLs (especially ones with images).

## Do not

- Put secrets, API keys, or private newsletter tokens in JSON.
- Use `body`/`sections` for new work when `blocks` will do.
- Reference files outside `public/` for local images.
- Invent routes or a CMS — this app is file-driven on purpose.
