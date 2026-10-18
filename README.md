# The Gazette

A Next.js weekly newspaper front end. The home page is a TikTok-style vertical snap feed of story previews; tap a slide to open the full article. Content comes from a single JSON file.

## Run locally

```bash
npm install
npm run dev -- --port 4317
```

Open [http://localhost:4317](http://localhost:4317).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Vertical snap feed of this week’s stories |
| `/article/[id]` | Full article |
| `/feed` | Redirects to `/` (legacy) |

## Weekly content

**Agents:** follow [`content/WEEKLY-UPDATE.md`](content/WEEKLY-UPDATE.md) — how to replace the edition, port newsletter HTML → JSON blocks, and attach local or remote images.

| Path | Purpose |
|------|---------|
| `content/issue.json` | Masthead + articles for the week |
| `public/images/articles/` | Local images (`src`: `/images/articles/…`) |

### Article body (`blocks`)

Prefer an ordered `blocks` array:

- `{ "type": "p", "text": "…" }`
- `{ "type": "h2" \| "h3" \| "h4", "text": "…" }`
- `{ "type": "image", "src": "/images/… or https://…", "alt"?, "caption"?, "credit"? }`

Legacy `body` (blank-line paragraphs) and `sections` (`heading` + `body`) still work and are normalized to blocks at render time.

### Minimal example

```json
{
  "title": "The Gazette",
  "weekOf": "2026-10-20",
  "articles": [
    {
      "id": "lead",
      "headline": "Your lead headline",
      "dek": "One-sentence deck.",
      "category": "City",
      "byline": "Harbor Herald",
      "blocks": [
        {
          "type": "image",
          "src": "/images/articles/harbor-ferry.png",
          "alt": "Pier at dusk"
        },
        { "type": "p", "text": "First paragraph." },
        { "type": "h2", "text": "What changed" },
        { "type": "p", "text": "Second paragraph." }
      ]
    }
  ]
}
```

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- No auth, database, or cron implementation in this repo

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
