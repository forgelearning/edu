# Forge application boundary

Forge remains a static deployment, but its browser code now has an explicit application boundary.

## Runtime layers

- `scripts/forge-api.js` owns Supabase configuration, request headers, timeouts, response parsing, error normalization, CRUD, RPC, and auth requests.
- `forge-auth.js` owns student session semantics and access/trial rules. It delegates network work to `ForgeAPI`.
- Page scripts own view state and rendering only. Legacy `supaGet`, `supaInsert`, and related names are compatibility adapters that delegate to `ForgeAPI` while pages are migrated.
- `data/forge-data.js` owns question-bank content and subject metadata; it must not contain transport or session logic.
- `scripts/forge-app.js` owns cross-surface application contracts: bounded session configuration, navigation entry points, dashboard-card composition, and content-confidence access. Page scripts consume these helpers rather than redefining those values locally.

## Rules for new work

1. Import `scripts/forge-api.js` before any page-specific script.
2. Call `ForgeAPI.get`, `ForgeAPI.rpc`, `ForgeAPI.insert`, `ForgeAPI.patch`, `ForgeAPI.remove`, or `ForgeAPI.auth` for Supabase access.
3. Keep access tokens in the request options; never create a second project URL, key, timeout, or error parser in a page.
4. Convert API failures into the shared state language through `ForgeState`; do not expose raw response text or database policy details.
5. Put reusable business rules in a shared script, then keep page files responsible for composition and presentation.

The existing static HTML entry points can therefore continue shipping independently while all new data behaviour has one reviewable boundary. The shared page shell is enforced by `scripts/checks/check-ui-system.js`; route availability is checked by `scripts/checks/check-routes.js`. This keeps the current static deployment controlled while a future application layer can be introduced behind the same API and component contracts.

## Page composition contract

Every page loads the delegated action layer and the generated compatibility
stylesheet. Marketing pages use the shared base/components/subject layers;
authenticated pages use the sidebar/components/state layers. Page overrides are
allowed only for composition or genuinely page-specific content. Shared logos,
navigation, actions, state messages, and dashboard primitives must not be
reimplemented locally.
