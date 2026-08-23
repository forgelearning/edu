# Performance benchmark

Run the reproducible browser benchmark with:

```bash
npm run benchmark:performance
```

The harness builds `_site`, launches a clean headless Chrome profile, disables
cache and service workers, blocks third-party analytics and font requests, and
measures cold loads with 80 ms network latency, 10 Mbps download bandwidth and
a 4× CPU slowdown. It reports medians across five runs by default. Set
`FORGE_PERF_RUNS`, `FORGE_PERF_ROUTES`, `FORGE_PERF_OUTPUT` or `FORGE_CHROME` to
override the run count, route list, JSON output path or Chrome executable.

## 2026-08-23 question-payload optimization

These results are medians of three cold runs under the profile above. The
browser used a fresh, signed-out profile, so they measure the cost of reaching
each route's initial usable state. The signed-out School Overview route redirects
to Teacher in both builds, so that row measures the guarded redirect path.
Authenticated Assignments and Anvil sessions
subsequently fetch only the subject payloads required by their current data;
Crucible fetches a payload after a subject is selected.

| Route | Transfer before → after | Load before → after | Script before → after | TBT before → after |
|---|---:|---:|---:|---:|
| Student Dashboard | 5,348.8 → 346.7 KiB | 10,317.7 → 725.5 ms | 5,347.8 → 23.5 ms | 5,415 → 35 ms |
| Assignments | 5,288.1 → 289.6 KiB | 9,932.0 → 564.2 ms | 5,205.0 → 17.5 ms | 5,161 → 0 ms |
| Anvil | 5,527.7 → 528.3 KiB | 10,356.3 → 890.0 ms | 5,263.9 → 26.8 ms | 5,277 → 39 ms |
| Crucible | 5,511.8 → 513.9 KiB | 11,335.7 → 883.4 ms | 6,311.8 → 21.2 ms | 6,313 → 30 ms |
| Profile | 5,520.5 → 518.3 KiB | 10,285.9 → 838.5 ms | 5,254.8 → 26.6 ms | 5,267 → 29 ms |
| Teacher | 6,824.1 → 2,509.6 KiB | 11,268.7 → 2,495.4 ms | 5,197.5 → 36.8 ms | 5,215 → 68 ms |
| School Overview → Teacher | 6,824.1 → 2,509.6 KiB | 11,206.7 → 2,560.8 ms | 5,125.8 → 33.9 ms | 5,139 → 69 ms |
| Home | 5,541.2 → 539.0 KiB | 9,882.8 → 855.8 ms | 5,416.0 → 84.4 ms | 5,214 → 22 ms |
| Forge Quiz control | 651.5 → 665.7 KiB | 983.2 → 966.0 ms | 37.7 → 33.8 ms | 76 → 51 ms |

Across the eight optimized routes, mean median load time fell by 88.4%,
scripting by 99.4%, total blocking time by 99.3%, initial same-origin transfer
by 83.3%, and JavaScript heap use by 91.5%.
The lightweight catalog is 35.7 KiB versus the 5,037.9 KiB monolith. Individual
subject payloads range from 122.5 to 732.8 KiB (231.7 KiB median), so selecting
one subject avoids 85.5–97.6% of the old question-data transfer.

The bottleneck was the synchronous download, parse and execution of
`data/forge-data.js` on routes that either needed only labels/counts, compact
response-attribution maps, or no question content until after user input. The
optimized routes start from `data/forge-catalog.js`; Assignments, Anvil and
Crucible hydrate only the banks their current state requires. Teacher and School
Overview use a 687.9 KiB question index for historical subject/spec attribution
without question bodies. Retired Anvil questions remain available through a
separate 91.9 KiB lazy payload.
