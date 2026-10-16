# The Gazette

A Next.js newspaper front end that renders a weekly issue from a single JSON file. The **home page** is a dense broadsheet index of every story (up to 25). Full article page templates come later.

## Run locally

```bash
npm install
npm run dev -- --port 4317
```

Open [http://localhost:4317](http://localhost:4317).

## Home layout

- Narrow masthead: title left, week/date right
- Multi-column grid (~4 columns on desktop → fewer on smaller screens) with hairline rules
- Each cell: large index number, title, dek/subtitle, short excerpt
- Scales from 1–25 articles in `content/issue.json` (extras beyond 25 are ignored on home)

## Weekly content: `content/issue.json`

Replace this file to publish a new edition. No auth, database, or CMS is required.

### Issue object

| Field | Required | Description |
|-------|----------|-------------|
| `title` | yes | Masthead brand, e.g. `"The Gazette"` |
| `weekOf` | yes | ISO date string for the week (`YYYY-MM-DD`) |
| `edition` | no | Volume / number line, e.g. `"Vol. XII · No. 41"` |
| `tagline` | no | Reserved / unused on the home index |
| `updatedAt` | no | ISO timestamp |
| `articles` | yes | Array of article objects (home shows first 25) |

### Article object

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Stable slug used as the DOM `id` |
| `headline` | yes | Article title |
| `dek` | no | Deck / subhead (shown under the title) |
| `category` | no | Fallback subtitle if `dek` is missing |
| `byline` | no | Author name (for future article pages) |
| `featured` | no | Reserved; home treats all stories equally |
| `template` | no | Hook for future full-article layouts (e.g. `"lead"`, `"standard"`) — unused on home |
| `body` | no* | Plain text; used for home excerpts |
| `sections` | no* | Array of `{ heading?: string, body: string }` — also used for excerpts |

\*Provide `body` and/or `sections`.

### Minimal example

```json
{
  "title": "The Gazette",
  "weekOf": "2026-10-20",
  "edition": "Vol. XII · No. 42",
  "articles": [
    {
      "id": "lead",
      "headline": "Your lead headline",
      "dek": "One-sentence deck.",
      "category": "City",
      "template": "lead",
      "body": "First paragraph.\n\nSecond paragraph."
    },
    {
      "id": "brief",
      "headline": "A shorter item",
      "category": "Arts",
      "body": "One or two short paragraphs."
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
