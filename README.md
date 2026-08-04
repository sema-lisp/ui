<div align="center">

<img src="https://sema-lang.com/logo.svg" alt="Sema" height="64">

# @sema-lang/ui

**Web Components for the [Sema](https://sema-lang.com) design system** — a Lisp with first-class LLM primitives.

[![CI](https://img.shields.io/github/actions/workflow/status/sema-lisp/ui/ci.yml?branch=main&label=CI&logo=github)](https://github.com/sema-lisp/ui/actions)
[![npm](https://img.shields.io/npm/v/@sema-lang/ui?color=c8a855&logo=npm)](https://www.npmjs.com/package/@sema-lang/ui)
[![License](https://img.shields.io/github/license/sema-lisp/ui?color=c8a855)](LICENSE)
[![Website](https://img.shields.io/badge/website-sema--lang.com-c8a855)](https://sema-lang.com)

</div>

Lit-based Web Components for the Sema design system. Framework-agnostic, consumes DESIGN.md tokens via CSS custom properties.

## Quick Start

### Standalone (notebook, playground, any HTML page)

```html
<link rel="stylesheet" href="tokens.css">
<script type="module" src="sema-ui.js"></script>

<sema-button variant="primary">Get Started</sema-button>
```

`dist/sema-ui.js` is a **self-contained ES module** — Lit is bundled inline, zero runtime dependencies. Drop it into any page alongside `tokens.css`.

### npm consumer (VitePress, Vite, any bundler)

```ts
import '@sema-lang/ui/tokens.css'
import '@sema-lang/ui'
```

When imported this way, lit stays external — your bundler deduplicates it.

## Commands

```sh
npm run dev           # Vite dev server with component showcase
npm run build         # Build standalone library (Vite → Rolldown)
npm run preview       # Preview built output
npm test              # Run tests and quit (Vitest + Playwright, headless)
npm run test:watch    # Run tests in watch mode (re-run on changes)
npm run test:ui       # Run tests with Vitest UI
npm run lint          # ESLint across all source files
```

## Components

| Component | Tag | Variants | Notes |
|-----------|-----|----------|-------|
| Button | `<sema-button>` | primary, secondary, ghost, icon, pill, run, debug, action | +danger modifier, +shortcut badge, +disabled |
| Tooltip | `<sema-tooltip>` | placement: top/bottom/left/right | CSS Anchor Positioning with fallback, Escape to dismiss |
| Toggle | `<sema-toggle>` | — | Used inside ToggleGroup, aria-checked synced |
| Toggle Group | `<sema-toggle-group>` | — | Arrow key navigation, `sema-change` event |
| Splitter | `<sema-splitter>` | direction: horizontal/vertical | Mouse + touch drag, keyboard arrows, `sema-resize` delta events, configurable step/shiftStep |
| Dialog | `<sema-dialog>` | — | Modal with focus trap, backdrop click, Escape close, scroll lock, header/body/footer slots |
| Tree | `<sema-tree>` / `<sema-tree-item>` | — | Nested items, keyboard arrows, expand/collapse chevron, auto depth calculation, `sema-tree-select` event |

## Architecture

- **Lit 3** — reactive Web Components with decorators
- **CSS custom properties** — all styling from `docs/design/DESIGN.md` tokens, zero hardcoded hex
- **CSS Anchor Positioning** — tooltip popups with `@supports` fallback (zero JS positioning)
- **Vite 6** — Rolldown-powered build, TypeScript compilation, `declaration: true`
- **Vitest 4** — Playwright browser mode, 49 tests, real Chromium rendering
- **ESLint** — `eslint-plugin-lit` + `eslint-plugin-lit-a11y` + `eslint-plugin-wc`
- **54.8 KB** unminified, **13.4 KB** gzipped (Lit + 8 components bundled inline)

## Integration

### Standalone (notebook, playground, any HTML page)
Copy `dist/sema-ui.js` + `src/styles/tokens.css` into your project, add `<link>` + `<script type="module">`. All 8 custom elements auto-register.

### Notebook (Rust binary)
Copy both files into `crates/sema-notebook/src/ui/`, register in `ui.rs` via `include_str!`, add to `index.html` before `notebook.js`.

### Playground (esbuild)
Copy both files to `playground/`, add `<link>` + `<script type="module">` to `index.html`. Components register globally before `dist/app.js` runs.

### Website (VitePress)
```ts
import '@sema-lang/ui/tokens.css'
import '@sema-lang/ui'
```

Vite deduplicates lit automatically.

## Publishing (npm)

```json
{
  "main": "src/index.ts",
  "module": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": { "import": "./src/index.ts", "types": "./src/index.ts" },
    "./standalone": { "import": "./dist/sema-ui.js" },
    "./tokens.css": "./src/styles/tokens.css"
  }
}
```

All best practices from [Lit's publishing guide](https://lit.dev/docs/tools/publishing/):
- ES2021 target, ESM modules, `.js` extensions on imports
- `HTMLElementTagNameMap` entries on every component
- Self-defining elements, exported classes
- TypeScript declarations generated (`declaration: true`)
- No bundled lit for npm consumers (use `./standalone` for bundled)

## Links

- **Website** — [sema-lang.com](https://sema-lang.com)
- **Playground** — [sema.run](https://sema.run)
- **Documentation** — [sema-lang.com/docs](https://sema-lang.com/docs/)
- **Repository** — [sema-lisp/ui](https://github.com/sema-lisp/ui)

## License

[MIT](LICENSE) © [Helge Sverre](https://github.com/HelgeSverre)
