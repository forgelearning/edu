# Forge visual system

## Direction

Forge uses a warm academic workbench world: paper and coal surfaces, ember actions, fine ruled structure, and product evidence presented as a working classroom instrument. The concept seed is `forge-folio-nexacore-gray`, derived from the approved Folio × NexaCore × Gray direction.

The landing-page memory is one sentence and one action: turn wrong answers into better answers, then try the live quiz. School-pilot updates remain secondary and are addressed only to teachers and school leaders.

## Colour

- Dark paper: `#171310` to `#211a15`; raised surfaces use the shared panel token.
- Light paper: `#f7f4ef`; raised surfaces: `#fffdf9`.
- Ink follows the shared white/coal semantic tokens.
- Ember is the only primary action and active-state colour.
- Muted copy must remain readable in both modes; use `#b9b1a8` dark and `#625d57` light as the landing baselines.
- Green and red are reserved for correct/repair feedback and errors.

## Typography

- Rethink Sans: display headings and strong product labels, 600–700 weight.
- Poppins: prose, navigation, controls, and metadata, 400–600 weight.
- JetBrains Mono: specification codes and compact machine-readable references only.
- Fonts are self-hosted in `assets/fonts/` with `font-display: swap`; do not restore runtime Google Fonts dependencies.
- Headlines should be short, balanced, and compact without being artificially narrow. Target two balanced lines on desktop and two to three on phones; never isolate a final word. Avoid generic eyebrow copy before headings; put useful state or context after the heading or in an instrument bar.

## Layout and depth

- Desktop uses a two-column first viewport: decisive promise and action on the left, live product proof on the right.
- Sections follow: credibility rail, repair loop, switchable audience window, evidence/subject directory, school-pilot close, grouped footer.
- Structural borders are the default depth device. Do not combine wide elevation shadows with bordered cards.
- Decorative geometry is limited to faint concentric diagnostic rings and restrained radial light; it must never compete with the product proof.
- Section headings use generous space, but the primary CTA must remain fully visible at 1280 × 720.

## Responsive behaviour

- At 900px and below, desktop navigation condenses to the Forge mark, grouped Menu control, and theme control.
- All interactive targets are at least 44px high.
- Mobile hero copy becomes concise, retains one proof point, stacks actions, and keeps the live question directly below.
- Product sidebars reflow to a two-by-two grid at phone widths; no horizontally clipped rails or fade masks.
- Evidence facts, form fields, and footer groups stack without changing their reading order.

## Interaction and motion

- The live demo must support wrong-answer scaffold, re-forged question, repaired/not-yet states, and reset.
- Audience tabs use complete tab semantics and arrow-key navigation.
- Mobile Menu closes after selection, outside click, or Escape.
- Theme state is initialised after the button exists so the icon and accessible label are correct on first render.
- Respect reduced motion and keep transitions brief and functional. Do not add ambient canvas animation to the landing page.

## Content and conversion

1. Primary: `Try the quiz — free`.
2. Secondary: inspect learning loop, product views, subjects, and evidence.
3. Tertiary: school-pilot updates for teachers and school leaders.

Use product truth from `PRODUCT.md`. Demonstration data must be labelled illustrative, current subject availability must link to inspectable pages, and unsupported outcomes or commercial claims must not be introduced.
