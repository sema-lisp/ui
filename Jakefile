# Jakefile — @sema-lang/ui component library (jakefile.dev).
#
# `@rooted` resolves relative paths against THIS repo so a workspace meta-repo can
# `@import "ui/Jakefile" as ui` and run `ui.build` / `ui.test` from the root.
@rooted

# File recipe: rebuild the standalone bundle only when sources/config change.
file dist/sema-ui.js: src/**/* package.json vite.config.ts tsconfig.json
    @command -v npm >/dev/null || { echo "npm not found — install Node.js" >&2; exit 1; }
    npm install
    npm run build

@group ui
@desc "Build the @sema-lang/ui bundle (incremental; skips if src unchanged)"
task build: [dist/sema-ui.js]
    echo "@sema-lang/ui bundle ready: dist/sema-ui.js"

@group ui
@desc "Start the Vite dev server with the component showcase"
task dev:
    @needs npm
    npm install
    npm run dev

@group ui
@desc "Type-check the sources (tsc --noEmit)"
task typecheck:
    @needs npm
    npm run typecheck

@group ui
@desc "Run component tests (Vitest + Playwright, headless)"
task test:
    @needs npm
    npm install
    npm test

@group ui
@desc "Lint the sources (ESLint)"
task lint:
    @needs npm
    npm run lint

@group ui
@desc "Regenerate the custom-elements manifest"
task analyze:
    npm run analyze

@group ui
@desc "Export the standalone <sema-code-typer> showcase bundle"
task export-typer:
    npm run export:typer
