# Local staging harness

The repository currently has production GitHub Pages but no separate public staging host. The local harness serves the real Forge pages and replaces the Supabase client with a controlled mock API, so browser failure paths can be tested without writing production data.

Start it from the repository root:

```bash
npm run staging -- --port 4174 --mode save-failure
```

Then open `http://127.0.0.1:4174/forge-quiz.html`.

Available modes:

- `save-failure`: returns a successful free-response save until `--failure-after`, then returns HTTP 503.
- `network-failure`: returns HTTP 503 for every free-response save.
- `quota`: returns the server-authoritative `daily_limit` response.

Example:

```bash
npm run staging -- --port 4174 --mode save-failure --failure-after 1
```

This harness lives under `dev/` and is excluded from the production Pages artifact.
