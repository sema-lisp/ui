# Changelog

All notable changes to `@sema-lang/ui` are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/), and the project adheres to
semantic versioning.

## [0.2.0]

### Added

- **`sema-editor`: `blur()` delegate.** Mirrors the existing `focus()` delegate,
  blurring the inner shadow textarea. Added so consumers that programmatically
  focus the editor (e.g. a notebook cell) can also programmatically blur it —
  restoring behavior the pre-migration light-DOM `<textarea>` had for free.
- **`sema-editor`: honors the native `autofocus` attribute.** `firstUpdated()`
  now calls `focus()` when the host carries `autofocus`, delegating into the
  inner textarea (a Lit `@property` can't be named `autofocus` — it collides
  with the HTMLElement IDL attribute).
- **`sema-editor`: gutter-line state exposed as part tokens.** A gutter line's
  `part` attribute now carries `breakpoint` and/or `current` alongside
  `gutter-line`, so consumers and e2e suites can target breakpoint/current-line
  state through the shadow boundary (`::part(gutter-line breakpoint)`,
  `[part~="breakpoint"]`) instead of coupling to internal class names.
- **`sema-editor`: documented keydown contract.** The class doc now states that
  the inner textarea's `keydown` bubbles composed to the host as public API, and
  that the component intercepts only Tab — it never calls `stopPropagation()` on
  any other key.
- **`sema-input` / `sema-textarea`: `testid` property.** Forwards onto the inner
  control as `data-testid`, matching the existing `sema-editor` / `sema-markdown`
  pattern, so shadow-piercing test queries (e.g. Playwright `getByTestId`) work.
- **`sema-button`: `variant="run"` + `danger` now reads as destructive at rest.**
  A run button in a danger state (e.g. "Stop" while running) represents a
  destructive action, so it now shows `--error` border + text at rest, not only
  on hover (unlike the hover-only danger modifier on `debug`/`action`).

### Changed

- **BREAKING: `sema-dialog` events renamed** `sema-dialog-open` → `sema-open`,
  `sema-dialog-close` → `sema-close`, aligning with `sema-popover`'s existing
  event names. Consumers listening for the old event names must update to the
  new ones.

### Fixed

- **`sema-dialog`: the open host has a real box.** The host's only child (the
  backdrop) is `position: fixed` and out of flow, so the open host used to
  compute 0×0 — visibility checks (a11y tooling, Playwright `toBeVisible`)
  reported a shown dialog as hidden. `:host([open])` is now itself
  `position: fixed; inset: 0`, matching what is visually painted.
- **`sema-popover`: panel no longer clipped by `overflow` ancestors.** The panel
  is now `position: fixed` instead of `position: absolute`, measured against the
  trigger's `getBoundingClientRect()` on open, flipped vertically when it
  would cross the viewport edge, and clamped horizontally so an edge-adjacent
  trigger can't push it off-viewport. Because the resulting coordinates are only
  valid until the page scrolls or resizes, the popover now closes on either
  while open (scrolling inside the popover's own content is exempt).

## [0.1.3]

### Added

- **`sema-input`: Enter submits the associated form.** A single-line native
  `<input>` implicitly submits its form on Enter, but the inner control lives in
  shadow DOM so that never reached a light-DOM `<form>`. `sema-input` now calls
  `requestSubmit()` on its associated form (via `ElementInternals.form`) on
  Enter, restoring the expected behavior when used inside a `<form>`. Added so
  form-heavy consumers (e.g. a sign-in form) can adopt `sema-input` without
  losing Enter-to-submit. `sema-textarea` is intentionally unchanged (Enter
  inserts a newline).

## [0.1.2]

### Added

- **`sema-input` / `sema-textarea`: `readonly` attribute.** Renders a
  display-only control whose value still participates in form submission. Reads
  as non-editable (dimmed, default cursor). Added so consumers can represent
  fixed fields (e.g. an account's immutable username) with the same component as
  the editable ones instead of falling back to a native `<input>`.
- **`sema-input` / `sema-textarea`: `maxlength` attribute.** Caps the number of
  characters the control accepts, forwarded to the inner control. Added so a
  bounded field (e.g. a report reason with a hard character limit) keeps its cap
  when moving off a native `<textarea>`.

## [0.1.1]

- Initial published component set: layout, form controls, tabs, overlays,
  code/markdown/editor, and the design-token stylesheets.
