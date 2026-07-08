# Changelog

All notable changes to `@sema-lang/ui` are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/), and the project adheres to
semantic versioning.

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
