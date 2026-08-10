# Public pages

Source HTML is grouped by product surface and curriculum level:

- `app/` — signed-in student and teacher surfaces.
- `auth/` — sign-up, password reset, and role selection.
- `guides/` — product and teacher guides.
- `marketing/` — landing, pricing, FAQ, privacy, and supporting pages.
- `subjects/a-level/` — A-Level subject pages.
- `subjects/gcse/` — GCSE subject pages.

The Pages build copies these files into `_site/` with their original flat
public filenames, so existing URLs and links remain stable.
