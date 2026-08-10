# Scripts

The browser-loaded Forge modules remain directly under `scripts/` because
their paths are public static-site URLs.

- `checks/` contains CI and local validation scripts.
- `build/` contains scripts that generate deployable or derived artifacts.
- `maintenance/` contains one-off migration and extraction tools.
- `support/` contains shared helpers used only by repository tooling.

`npm run pages:build` creates the deployable `_site/` directory from the
organized sources in `pages/`.

The Pages workflow excludes the three tooling directories from the published
site. Runtime modules in the top-level directory are part of the application
and must remain deployable.
