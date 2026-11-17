# Mohammed M.

Personal site for Mohammed M., a full-stack and AI engineer in Erbil. The page is one git log: the latest commit is the intro, projects sit on the graph, and contact links are remotes.

Live at [icyren.dev](https://icyren.dev).

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion

Fira Code is loaded with `next/font`.

## Develop

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

```bash
npm run build
npm run start
npm run lint
```

## Content

The intro and the commit list live in `src/data/log.ts`. Contact links live in `src/components/Remotes.tsx`. A CV remote is included only when `public/cv.pdf` is present.

`public/images/avatar.jpg` stays in the repo. The page does not render it.

## Deploy

Push `master`. Vercel builds the site and serves it at [icyren.dev](https://icyren.dev).
