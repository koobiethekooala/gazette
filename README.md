# The Gazette

A Next.js newspaper front end that renders a weekly issue from a single JSON file. Update the file each week (cron, agent, or by hand); the layout scales to any article count.

## Run locally

```bash
npm install
npm run dev -- --port 4317
```

Open [http://localhost:4317](http://localhost:4317).

## Weekly content: `content/issue.json`

Replace this file to publish a new edition. No auth, database, or CMS is required.

### Issue object

| Field | Required | Description |
|-------|----------|-------------|
| `title` | yes | Masthead brand, e.g. `"The Gazette"` |
| `weekOf` | yes | ISO date string for the week (`YYYY-MM-DD`) |
| `edition` | no | Volume / number line, e.g. `"Vol. XII · No. 41"` |
| `tagline` | no | Short line under the masthead |
| `updatedAt` | no | ISO timestamp for the footer |
| `articles` | yes | Array of article objects (any length) |

### Article object

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Stable slug used as the DOM `id` |
| `headline` | yes | Article title |
| `dek` | no | Deck / subhead |
| `category` | no | Section label (City, Culture, …) |
| `byline` | no | Author name (rendered as `BY …`) |
| `featured` | no | If `true`, shown as the lead story; otherwise the first article is featured |
| `body` | no* | Plain text; paragraphs separated by blank lines |
| `sections` | no* | Array of `{ heading?: string, body: string }` blocks |

\*Provide `body` and/or `sections`.

### Minimal example

```json
{
  "title": "The Gazette",
  "weekOf": "2026-10-20",
  "edition": "Vol. XII · No. 42",
  "tagline": "What mattered this week.",
  "articles": [
    {
      "id": "lead",
      "headline": "Your lead headline",
      "dek": "One-sentence deck.",
      "category": "City",
      "byline": "A. Reporter",
      "featured": true,
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
