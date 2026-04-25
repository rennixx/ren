<div align="center">

<br/>

<h1>REN<span style="color: #00e5ff">://</span></h1>

### Futuristic System UI Portfolio Dashboard

<br/>

```typescript
const ren = {
  location: "localhost:3000",
  status: "ONLINE",
  uptime: "99.9%",
  architecture: "single-viewport dashboard",
  stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"],
};
```

<br/>

<a href="https://nextjs.org" target="_blank">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js" alt="Next.js" />
</a>
<a href="https://react.dev" target="_blank">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
</a>
<a href="https://www.typescriptlang.org" target="_blank">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
</a>
<a href="https://tailwindcss.com" target="_blank">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
</a>
<a href="https://www.framer.com/motion/" target="_blank">
  <img src="https://img.shields.io/badge/Framer_Motion-12-0055FF?style=flat-square&logo=framer" alt="Framer Motion" />
</a>

<br/>

</div>

---

### Overview

A single-viewport portfolio dashboard inspired by sci-fi HUD interfaces. No scrolling. No multiple pages. Everything visible at once in a full-screen system UI layout with cyan neon accents, diamond-cut panel corners, circuit connectors, and HUD data readouts.

```
┌──────────────────────────────────────────────────┐
│  ██████╗ ███████╗███╗   ██╗███████╗██████╗  ████ │
│  ██╔══██╗██╔════╝████╗  ██║██╔════╝██╔══██╗ ████ │
│  ██████╔╝█████╗  ██╔██╗ ██║█████╗  ██████╔╝ ████ │
│  ██╔══██╗██╔══╝  ██║╚██╗██║██╔══╝  ██╔══██╗ ████ │
│  ██║  ██║███████╗██║ ╚████║███████╗██║  ██║ ████ │
│  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═══╝│
├──────────┬─────────────────────────┬─────────────┤
│          │                         │             │
│ Profile  │     Hero Display        │   System    │
│ Panel    │     ┌─ ─ ─ ─ ┐         │   Stats     │
│ ┌──┐     │     │ ◉ rotating │      │   ┌─┐      │
│ │⬡ │     │     │   rings    │      │   │▓│      │
│ └──┘     │     └─ ─ ─ ─ ┘         │   │▓│      │
│ Name     │     WELCOME TO          │   │▓│      │
│ ─────    │     PORTFOLIO_          │   └─┘      │
│ Skills   │     ──────────          │   0x0C     │
│ ████ 92% │     [View Work] [CTA]   │   3+ yrs   │
│ ███  88% ├─────────────────────────┤   99.9%    │
│ ██   85% │                         │             │
│          │   ┌──────┐ ┌──────┐     │             │
│ [GH][LI] │   │ #01  │ │ #02  │     │             │
│ [EM][TW] │   └──────┘ └──────┘     │             │
│          │   ┌──────┐ ┌──────┐     │             │
│          │   │ #03  │ │ #04  │     │             │
│          │   └──────┘ └──────┘     │             │
└──────────┴─────────────────────────┴─────────────┘
```

### Features

- **Single-viewport dashboard** — full-screen layout, zero scrolling
- **Diamond-cut panels** — angled clip-path corners on every element
- **Circuit connectors** — gradient lines linking panels together
- **HUD data readouts** — hex codes, signal bars, progress rings, mini bar charts
- **Rotating SVG rings** — animated concentric circles behind the hero
- **Skills progress bars** — gradient fills with percentage labels
- **Staggered animations** — panels fade in sequentially on load
- **Responsive** — adapts to tablet (2-col) and mobile (stacked)
- **Accessible** — `prefers-reduced-motion` support, keyboard navigation, semantic HTML

### Quick Start

```bash
# Clone
git clone https://github.com/rennixx/ren.git
cd ren

# Install
npm install

# Run
npm run dev
```

Open [localhost:3000](http://localhost:3000) and you're in.

### Customize

Edit `src/data/profile.json` — that's the single source of truth for all content:

```json
{
  "name": "Your Name",
  "title": "Your Title",
  "bio": "Your bio...",
  "skills": [{ "name": "React", "level": 92 }],
  "projects": [{ "id": "01", "name": "Project", "tags": ["React"] }],
  "stats": { "projectCount": 12, "experience": "3+" },
  "contact": { "github": "https://github.com/you" }
}
```

Drop your avatar at `public/images/avatar.png`.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, SSG) |
| UI | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 12 |
| Font | System monospace stack (zero font loading) |

### Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout + meta
│   ├── page.tsx            # Dashboard grid assembly
│   └── globals.css         # Theme + clip-path classes
├── components/
│   ├── TopNav.tsx          # Hex logo, nav links, status
│   ├── ProfilePanel.tsx    # Avatar, skills, contact
│   ├── HeroDisplay.tsx     # Rotating rings, CTA
│   ├── ProjectGrid.tsx     # 2x2 card container
│   ├── ProjectCard.tsx     # Individual project card
│   ├── StatsPanel.tsx      # Signal bars, hex readouts
│   ├── HexAvatar.tsx       # Hexagonal SVG frame
│   └── CircuitConnector.tsx # Gradient line links
└── data/
    └── profile.json        # All portfolio content
```

### Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint
```

### Deploy

Push to GitHub and connect to [Vercel](https://vercel.com) — zero config needed.

---

<div align="center">

**Built with /// SYSTEM_UI**

</div>
