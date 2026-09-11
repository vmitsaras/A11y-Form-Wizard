# AGENTS.md - A11y Form Wizard Plugin

This repository contains a reusable accessible multistep form wizard.

## Architecture

- Keep the plugin vanilla JavaScript.
- Do not introduce a framework for this widget.
- Start from semantic HTML and progressively enhance it.
- Keep all state local to each plugin instance.
- Use native form controls wherever possible.
- Avoid global stores and unnecessary dependencies.

## JavaScript Rules

- Main class name: `A11yFormWizard`.
- Root data attribute: `data-a11y-form-wizard`.
- Keep frozen default options.
- Keep selectors, classes, attributes, and event names in shared constants.
- Parse all `data-*` values safely before use.
- Prevent duplicate initialization with `WeakMap`.
- Bind event handlers once in the constructor.
- Remove all listeners in `destroy()`.
- Dispatch bubbling lifecycle events.
- Keep the public API small.
- Do not create SPA-style routing.

## Accessibility Rules

- Use `form`, `fieldset`, `legend`, `label`, `input`, and `button` correctly.
- Do not replace native radio or checkbox semantics with clickable `div` elements.
- Keep focus visible.
- Move focus intentionally when changing steps.
- Announce dynamic step changes and errors through a live region.
- Use ARIA only when native HTML is insufficient.
- Preserve keyboard behavior for Tab, Shift+Tab, Space, and Enter.
- Respect `prefers-reduced-motion`.

## CSS Rules

- Use BEM classes under `.a11y-form-wizard`.
- Use public custom properties with the `--afw-*` prefix.
- Use private/internal custom properties with the `--_*` prefix.
- Do not rely on color alone for state.
- Maintain mobile-first responsive behavior.
- Do not remove outlines without a replacement.

## Testing Checklist

- Keyboard-only completion works.
- Duplicate initialization returns the existing instance.
- `destroy()` removes listeners and reveals all steps again.
- Invalid fields are announced and focused.
- Step changes update progress text and progress value.
- Form works as meaningful markup before JavaScript runs.
- No runtime dependencies are required.
