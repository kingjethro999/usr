# unixsr web

The official web application and interactive manual for `unixsr` (Unix Style Request).

Built with **Next.js 16**, **Tailwind CSS**, and pure in-memory mock client simulation.

## Features

- **Interactive Terminal REPL:** Client-side mock REST simulation with zero network calls, shell pipe syntax, history navigation, and tab autocompletion.
- **ANSI 16-Color Theme Engine:** 4 retro terminal themes (`night`, `paper`, `amber`, `phosphor`) powered by CSS custom properties and `useSyncExternalStore`.
- **Manual Pages (`man`):** Full documentation system with `/man` index and `/man/[command]` static pages.
- **Character Grid Layout:** 80ch constrained typography with pure monospace design and keyboard shortcuts (`t` theme, `?` help, `/` search, `Esc` clear).

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the terminal.

## Build & Test

```bash
pnpm lint
pnpm build
```

## License

MIT
