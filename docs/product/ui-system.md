# Forge UI system contract

Forge is a static site with a shared visual and interaction layer. Every HTML
entry point must load the shared tokens, base/components, generated utility
CSS, and delegated action script. App pages may additionally load the sidebar,
states, and subject-specific styles.

## Shared layers

- `css/tokens.css` is the source of colour, type, spacing, radius, and motion
  values.
- `css/base.css` owns the marketing shell and shared navigation.
- `css/components.css` owns reusable cards, buttons, states, metadata, rows,
  and dashboard primitives.
- `css/sidebar.css` owns the authenticated app shell.
- `css/generated-utilities.css` is a compatibility layer for legacy pages;
  new UI must use named component classes instead of adding utilities.
- `css/page-overrides/*.css` contains page-specific composition only. It must
  not redefine the shared navigation, logo, button, card, or state language.

## Interaction contract

HTML uses `data-forge-action` and `scripts/forge-page-actions.js` for page
actions. The sidebar uses `data-forge-sidebar-action` and one delegated handler
in `scripts/forge-sidebar.js`. Runtime-generated markup must not emit inline
event attributes.

Dynamic inline styles are permitted only when a value is calculated from live
state, such as a progress width or a subject colour. Static presentation
belongs in CSS and is checked by `scripts/checks/check-ui-system.js`.

## State language

Use the shared `forge-status` variants: loading, error, success, and focus.
Every remote data view must distinguish loading, failed, empty, and populated
states, and provide a plain-language retry action for recoverable failures.

## Review gate

Before shipping, run:

```sh
node scripts/checks/check-ui-system.js
node scripts/checks/check-content-readiness.js
node scripts/checks/check-question-bank.js
node scripts/checks/check-spec-coverage.js
node scripts/checks/check-routes.js
```

The route check is intentionally separate from the markup check: static pages
can be structurally valid while still linking to a missing asset or route.
