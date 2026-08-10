# Forge Design System

Forge uses a heated workshop metaphor: dark, focused surfaces with ember accents. The interface should feel energetic around progress and restrained around study tasks.

## Tokens

- Background: `--coal`
- Primary surface: `--panel`
- Elevated surface: `--panel-2`
- Border: `--line`
- Primary action: `--ember`
- Attention / progress: `--hot`
- Body text: `--slate`
- Muted text: `--dim`
- Success: `--good`
- Error / Crucible: `--bad`
- Spacing: `--space-1` through `--space-11`, on a 4px scale
- Radius: `--radius-xs`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`

## Component rules

- Use one primary action per view.
- Use `.forge-button--primary` only for the main action; use `.forge-button--secondary` for alternatives.
- Use `.forge-card` for bounded content and `.forge-card--glass` only for high-level surfaces.
- Use `.forge-card--focus` for recommendations and active learning priorities.
- Use `.forge-status` for empty, loading, success, and error feedback. Pair colour with text.
- Keep decorative glow and lift out of secondary cards.
- Prefer 44px touch targets on mobile.
- Keep labels plain alongside metaphorical names: “Anvil — Repair misconceptions”.

## Typography

- Sora: headings and high-emphasis display text.
- Inter: body, controls, and interface copy.
- JetBrains Mono: metadata, tags, status labels, and numerical readouts.

## Motion and accessibility

- Use 150–300ms transitions for interface changes.
- Animate opacity and transform only.
- Preserve visible `:focus-visible` states.
- Respect `prefers-reduced-motion`.
- Do not use colour as the only signal for status.
