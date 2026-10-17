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
| `/` | Vertical snap feed of this week’s stories (max 25) |
| `/article/[id]` | Full article |
| `/feed` | Redirects to `/` (legacy) |

## Weekly content: `content/issue.json`

Replace this file to publish a new edition. No auth, database, or CMS is required.

### Issue object

| Field | Required | Description |
|-------|----------|-------------|
| `title` | yes | Brand, e.g. `"The Gazette"` |
| `weekOf` | yes | ISO date string for the week (`YYYY-MM-DD`) |
| `edition` | no | Unused on the current UI |
| `tagline` | no | Unused on the current UI |
| `updatedAt` | no | ISO timestamp |
| `articles` | yes | Array of article objects (feed shows first 25) |

### Article object

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Stable slug used in `/article/[id]` |
| `headline` | yes | Article title |
| `dek` | no | Deck / subhead |
| `category` | no | Section label (shown on slides) |
| `byline` | no | Publication name (shown with a small avatar) |
| `featured` | no | Reserved |
| `template` | no | Hook for future full-article layouts |
| `body` | no* | Plain text; paragraphs separated by blank lines |
| `sections` | no* | Array of `{ heading?: string, body: string }` |

\*Provide `body` and/or `sections`.

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
      "body": "First paragraph.\n\nSecond paragraph."
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
