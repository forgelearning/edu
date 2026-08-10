# Forge professional product audit

**Audit date:** 9 August 2026  
**Scope:** Forge repository at `/Users/michaelzanier/edu` as provided in this session.  
**Overall assessment:** Promising learning product with a coherent core loop and unusually strong content guardrails. The initial audit identified release risks in live verification, public metadata, semantic HTML, entitlement handling, and multi-surface navigation; the remediation passes below address the confirmed issues. Concurrent isolated-user permission testing and broader responsive/error-state coverage remain follow-up work.

## Executive judgement

Forge has a clear educational thesis: diagnose the misconception, explain it, then re-test the same concept from another angle. The codebase reflects that idea well. The question-bank checks are strong, the shared API/state boundaries are sensible, and the product language gives the student and teacher surfaces a memorable mental model.

The weakest area is product consistency. Forge is a large static site with many independently authored pages and several generations of UI conventions. That creates avoidable defects in metadata, content-status freshness, semantic HTML, and navigation behavior. The public experience is likely to feel more polished on the landing and subject pages than inside the authenticated student/teacher workflows, where error, loading, session, and data states are more consequential.

I would rate the current product **6.5/10 for readiness**:

- **Learning model:** 8/10
- **Content structure and coverage:** 8/10
- **Visual direction:** 7/10
- **Navigation and information architecture:** 6/10
- **Accessibility and semantic robustness:** 5/10
- **Functional confidence:** 7/10 after verifying the main student loop and a sequential disposable teacher/class/student workflow; concurrent isolated-user permissions and broader responsive/error-state coverage remain unverified.
- **Release hygiene/SEO:** 5/10

## What was tested

### Initial automated and source-level checks

- `node dev/audit-banks.js`: passed; 7,510 gradeable stems checked, 0% cued stems and 0% cued reforge twins, with 0 structural issues.
- `node dev/test-forge.js`: passed; 7,710 MCQs checked.
- `node scripts/checks/check-ui-system.js`: passed; 61 pages, no inline style blocks, no inline event attributes in maintained markup, no direct page-level Supabase transport, and no subject pages missing required shared CSS.
- Local-reference scan: 0 broken local path references after correctly ignoring query strings and fragments.
- Initial `node scripts/checks/check-content-readiness.js`: failed on stale content status for `hist`; the regenerated contract passes in the final verification.
- `node scripts/checks/check-routes.js`: could not run against the local server because this environment denied loopback HTTP access (`EPERM`); this is an environment limitation, not evidence that the routes are broken.
- Repository inventory: 61 HTML pages, 33 canonical subjects, 168 banks, and 7,805 questions reported by the content-readiness script.
- Duplicate-id scan found 10 source-level duplicate IDs; several are generated-template strings rather than guaranteed runtime DOM duplicates and need browser confirmation before being treated as defects.

### Initial live interaction limitation

At the initial audit stage, the in-app browser refused both `http://127.0.0.1:8000` and the canonical deployed site. That initial snapshot could not claim a completed click-by-click browser pass, responsive screenshot pass, network-console pass, or authenticated student/teacher pass. The report therefore labels the original behavioral items as **needs live confirmation**; later dated sections record the browser permissions recovery and the completed disposable-account workflow.

## Findings by priority

### P0 — initial release blocker: live authenticated workflows were unverified

**Current status:** Partially resolved. The main student learning loop and a sequential disposable teacher/class/student workflow are now verified. Concurrent cross-user permission testing still requires isolated browser contexts because the in-app browser shares authentication storage between tabs.

**Impact:** Student sign-up, student login, session refresh, dashboard data, Anvil, Crucible, assignments, teacher sign-up/invite, class creation, assignment creation, school overview, CSV export, and sign-out could not be exercised end to end.

**Why it matters:** These are the product, not secondary pages. Static checks cannot catch a bad Supabase policy, an expired token path, a mismatched response shape, a missing empty state, a broken redirect, or a UI event that points to a missing function.

**Remaining action:** Add a reproducible isolated-context browser suite covering fresh and returning sessions, expired/invalid sessions, empty datasets, failed requests, mobile widths, destructive confirmations, and cross-user reads/writes. Keep account creation/deletion auditable.

### P1 — initial finding: incorrect Open Graph URLs on five subject pages

**Current status:** Resolved. All public pages now have matching `og:url` and canonical links; the final verification found zero metadata mismatches.

The initial snapshot showed these pages advertising the Sociology URL even though they were different routes:

- `a-level-geography.html`
- `a-level-history.html`
- `criminology.html`
- `law.html`
- `politics.html`

For example, the initial `a-level-geography.html:11` and `law.html:11` values pointed to `a-level-sociology.html`, producing wrong link previews, poor canonical identity, and confusing sharing behavior.

**Remediation applied:** Set each `og:url` to the page’s own canonical URL and add explicit `<link rel="canonical">` tags consistently across all public routes.

### P1 — initial finding: content-status data is stale

**Current status:** Resolved. `data/content-status.json` was regenerated and the final content-readiness check reports a current contract.

The initial `node scripts/checks/check-content-readiness.js` run failed with `Stale content status for hist`. The initial generated file reported `generatedAt: 2026-08-04T13:26:54.017Z` in `data/content-status.json:3`, while the question data no longer matched the stored subject totals.

**Impact:** Public subject pages can show inaccurate counts or rollout labels. This is especially damaging for a revision product because question-count and coverage claims are part of the trust proposition.

**Remediation applied:** Ran `node scripts/build/build-content-status.js` and reviewed the regenerated contract. Generation should still become a release/build requirement so stale status cannot ship.

### P1 — initial finding: dynamic product actions are not consistently keyboard/semantic-safe

**Current status:** Resolved for the audited static HTML surface. Every button now has an explicit type and the UI-system check passes; a future lint rule is still recommended.

The initial source scan found **690 buttons without an explicit `type` attribute** across the HTML pages. Many were harmless because they sat outside forms, but the pattern was unsafe and made future regressions easy. The most important examples were the FAQ controls (`faq.html:82` onward), landing-page demo options (`index.html:124` onward), and generated buttons in the student/teacher surfaces.

**Impact:** A button later moved inside a form can unexpectedly submit it. Controls also lack a single enforceable semantic contract across the static pages.

**Remediation applied:** Made every button explicit: `type="button"` for UI actions and `type="submit"` only for actual form submission. A future lint rule should fail new buttons without a type.

### P1 — initial finding: payment/trial flow needs a transactional review

**Current status:** Partially resolved. The client no longer uses a fake paid return or unused Stripe link, and Pro/trial access is checked from the session response. A real server-verified billing/webhook integration remains unimplemented.

The initial `forge-signup.html:284-290` implementation created the Supabase account and subscriber/trial record, then redirected directly to `forge-signup.html?paid=1`. The route name and success copy implied a Stripe return, but the code did not establish that a Stripe checkout session had been created or that payment/trial state had been verified server-side.

**Initial risk:** Account creation, trial entitlement, and payment status could drift apart. A client-controlled `paid=1` query flag was not trustworthy payment proof.

**Remediation applied:** Removed the fake paid return state, made the confirmation explicitly trial-based, and enforced Pro/trial access from the session response. A real server-verified billing/webhook integration and tests for abandoned checkout, duplicate checkout, webhook delay, cancellation, and success-URL refresh remain future work.

### P1 — initial finding: data transport exposes the public Supabase client configuration in shipped JavaScript

**Current status:** Reviewed. The anonymous key remains public by design; the final Supabase smoke tests pass, but ongoing RLS/RPC authorization tests remain necessary as the schema evolves.

`scripts/forge-api.js:5-11` includes the project URL and anonymous key. An anonymous Supabase key is normally public by design, so this is not automatically a secret leak. However, it makes the security of every table and RPC entirely dependent on RLS and function grants.

**Review completed:** Ran `node dev/audit-supabase-security.js` against the live project. The smoke tests confirmed the protected school overview and invite-code table boundaries and fail-closed free-student RPCs. Ongoing RLS/RPC authorization tests remain necessary as the schema evolves.

### P2 — public pages have metadata and content consistency drift

The incorrect `og:url` issue is an instance of a broader maintenance problem: subject pages are largely duplicated static documents with per-page inline data and scripts. The repo’s own `CLAUDE.md` documents known content-quality backlogs, including misconception taxonomy work and distractor padding in thousands of options. Structural audits pass, but they do not prove that explanations are pedagogically correct, culturally appropriate, or syllabus-accurate.

**Recommendation:** Generate subject metadata and route wiring from a single registry. Add a content QA sample per subject: answer correctness, explanation quality, distractor plausibility, spec-point accuracy, and reforge distinctness.

### P2 — the navigation model is memorable but metaphor-first in places

Forge / Anvil / Crucible is distinctive, but a new student must learn what each tool means. The design documentation correctly says to pair metaphorical names with plain language, yet the product should make that mapping explicit at the point of choice, not only in guides.

**Recommendation:** Always display the plain-language descriptor in navigation and first-run cards, e.g. `Anvil — Repair misconceptions`, `Crucible — Timed exam practice`, `Forge — Focused practice`.

### P2 — the landing page is doing too much product simulation

`index.html` contains student and teacher preview dashboards, interactive demo questions, a subject directory, marketing claims, pricing/waitlist CTAs, and school overview previews. This is persuasive but cognitively dense.

**Recommendation:** Make the first screen answer three questions in order: who Forge is for, what happens after a wrong answer, and what the visitor should do next. Move deeper previews into dedicated sections or routes and reduce competing tabbed simulations.

### P2 — accessibility needs runtime verification despite good intent

Positive signs include `lang="en-GB"`, viewport tags, visible labels on auth fields, `aria-live` state containers, `role="tablist"` usage, and explicit theme-toggle labels. Risks needing a real accessibility pass include:

- repeated generated controls with no guaranteed accessible name beyond visible text;
- tab interfaces where `aria-selected`/`aria-controls` must stay synchronized after every state change;
- dynamically injected content whose focus destination is not obvious;
- custom sidebar/bottom-tab behavior at the 820px breakpoint;
- color and glow-heavy surfaces that need contrast testing in both themes;
- keyboard and reduced-motion behavior that cannot be proven from source alone.

**Recommendation:** Test with keyboard only, VoiceOver/NVDA, 200% zoom, 320px width, light/dark theme, and `prefers-reduced-motion`. Add automated axe or equivalent checks to CI.

## Surface-by-surface evaluation

### Marketing and discovery

**Strengths:** Strong differentiation, clear evidence-led positioning, good subject breadth, pricing tiers, school-oriented explanation, and a consistent visual metaphor. The FAQ and evidence pages support trust rather than relying only on promotional claims.

**Risks:** The landing page has a high interaction and copy density. Repeated static previews can create an expectation that all preview actions are real product actions. Pricing makes specific claims about trial, access, and school licensing that need to match the implemented payment and entitlement flow.

**Priority improvements:** simplify the hero, clarify free vs Pro vs school access, and add a single explicit “what happens after I get a question wrong” walkthrough.

### Subject pages

**Strengths:** Broad subject coverage, exam-board specificity, shared CSS, sample interactions, and a consistent route structure. The content-readiness overlay is a good honesty mechanism.

**Risks:** Metadata drift, stale status data, duplicated route content, and uneven subject depth. Automated readiness says 32 full and 1 developing canonical subject; A-Level Geography is at 91% mapped specification coverage and Mandarin is marked developing.

**Priority improvements:** fix metadata, regenerate status, and ensure each subject page distinguishes “bank exists” from “coverage is complete”.

### Student Forge

**Expected core experience:** choose subject/bank, answer, receive a scaffold, then complete a reforge twin. The question checks strongly support this loop.

**Needs live confirmation:** free-tier quota, session persistence, question selection, answer locking, scaffold timing, reforge correctness, progress persistence, back navigation, mobile answer-button sizing, and recovery after an API failure.

**Priority improvements:** make the next action after feedback unmistakable, preserve context when navigating back, and show what is saved locally versus remotely.

### Anvil

**Expected value:** turns wrong answers into a repair queue instead of a dead-end score. This is Forge’s strongest product idea.

**Needs live confirmation:** misconception aggregation, three-in-a-row resolution, badge counts, rework routing, class-linked data, and empty/expired states.

**Priority improvements:** explain the resolution rule at the moment a misconception is added, and show “why this is recommended” with a short plain-language explanation.

### Crucible

**Expected value:** a useful contrast to scaffolded practice: timed, no-hint pressure testing.

**Needs live confirmation:** timer correctness, question count, finishing behavior, accidental exit, restart, scoring, and whether results feed back into Anvil without double-counting.

**Priority improvements:** add an explicit pre-start confirmation showing duration, number of questions, and what will be recorded.

### Student account and profile

**Strengths:** password reset exists, session adoption from confirmation hashes is considered, and sign-out clears derived local state.

**Risks:** account creation and entitlement are tightly coupled to client-side routing; profile and dashboard load errors need live testing; fields should have robust autocomplete and password guidance consistently.

### Teacher dashboard

**Strengths:** the teacher promise is concrete: heatmap, class overview, student drill-down, starters, assignments, school overview, and class mode. The app boundary and shared state language are good foundations.

**Risks:** many important actions are data-dependent and therefore invisible to static checks. Teacher dashboard failures could leave a visually convincing but empty app if a response shape or policy differs from the assumption.

**Priority improvements:** build a seeded demo/test tenant, add deterministic fixtures for empty/large/error states, and test class switching, deletion confirmations, assignment editing, and CSV output with real keyboard interaction.

## Teacher and student usability assessment

### As a student

Forge’s likely best moment is immediately after a wrong answer: the explanation is specific, the error is named, and the reforge promises another attempt. The biggest usability question is whether students understand what to do next without reading a guide. A student should never have to decode “bank”, “spec point”, “Anvil”, or “Crucible” to start learning.

Students also need reassurance that mistakes are useful rather than punitive. Copy should emphasize repair and progress, while score, streak, and leaderboard surfaces should remain secondary to the explanation.

### As a teacher

The teacher story is compelling because it connects response data to an action: a starter activity. The risk is dashboard overload. Heatmaps, spec points, tags, starters, assignments, and school reporting can become a reporting system rather than a teaching system.

The default teacher view should answer one question: **what should I teach next, and which students need it?** Everything else should be drill-down.

## Original remediation order

The following was the order proposed in the initial audit. Completed items are recorded in the dated remediation sections below; the remaining items are follow-up priorities.

1. Enable a permitted end-to-end browser test and test real student/teacher workflows with disposable accounts.
2. Fix the five incorrect `og:url` values and add canonical tags.
3. Regenerate and commit `data/content-status.json`; make staleness a build failure.
4. Harden the trial/payment entitlement flow so access is server-verified.
5. Add explicit button types and an accessibility lint rule.
6. Run the Supabase security audit against the deployed project, with special attention to cross-user reads/writes and RPC grants.
7. Add seeded fixtures for empty, loading, error, expired-session, and populated teacher/student states.
8. Reduce landing-page density and make the Forge/Anvil/Crucible mapping explicit.
9. Add content QA beyond structural checks, beginning with the known misconception-tag and distractor-padding backlogs documented in `CLAUDE.md`.

## Final verdict

Forge has a credible product core and a strong educational mechanism. The repository is not a fragile prototype in the content layer: the question-bank regression discipline is a real strength. The priority fixes in this report are now merged and live-verified at the source/HTTP level, and the main student loop plus sequential teacher workflow have been exercised with disposable data. Forge should still add isolated-context browser coverage for concurrent permissions, responsive breakpoints, and deeper empty/error states before calling the audit fully closed.

## Live browser verification — 2026-08-09

The saved Codex browser-session deny list was cleared for the Forge deployment origin. A disposable local student session named `Audit Student` was created and then signed out successfully; no external account or class data was created.

### Verified student workflows

- Quiz entry validation rejects an empty first name with an inline “Enter your first name” message.
- Free-session creation succeeds and presents the subject picker.
- A Level Economics selection opens the bank/session picker with the recommended eight-question session.
- A wrong practice answer records the misconception, exposes an explanation, and offers `Re-forge` and `Next`.
- Re-forge presents a related twin question; a correct answer reports `Reforged`.
- Anvil tracks the misconception and requires three consecutive correct answers. Completing the sequence shows `Misconception cleared!` and removes it from the active pile.
- Crucible launches a six-question, five-minute timed run. The timer visibly decreases and wrong answers are sent to Anvil without scaffolding.
- Settings theme radios are exposed correctly and the account-level sign-out removes the disposable session.

### Live issue found

Settings displays `Notifications are blocked in device settings`. Activating `Enable notifications` produced no visible success, failure, or next-step feedback in the browser. The control should either explain that browser permission must be enabled outside Forge, or show a clear permission-denied/error state after the request is rejected.

### Audit status

The main student learning loop is now browser-verified. Teacher authentication, class creation/joining, assignments, and real multi-user permissions remain to be tested separately because this pass used only a disposable local student session and did not create a teacher account or class.

## Priority-fix batch — 2026-08-09

- Corrected incorrect `og:url` values on `a-level-geography.html`, `a-level-history.html`, `criminology.html`, `law.html`, and `politics.html`.
- Regenerated `data/content-status.json` from the canonical question and specification registries. The previous stale `hist` status failure is resolved; the contract now reports 33 subjects and 33 marketing pages.
- Re-ran bank, UI-system, content-readiness, metadata, and visual-detector checks. All passed; the Forge regression suite checked 7,710 MCQs.

## Supabase security pass — 2026-08-09

The read-only public-boundary smoke test passed: school overview and invite-code table access are blocked anonymously, and the free-history/free-quota RPCs fail closed for invalid tokens.

Supabase security advisors identified:

- One mutable function search path on `public.backfill_response_class_ids`.
- One informational RLS-without-policy finding on `teacher_invite_codes`; direct table access is intentionally revoked.
- Multiple anonymous `SECURITY DEFINER` RPCs. These are part of the current anonymous student/class-code design and require individual authorization tests, not blanket removal.
- Leaked-password protection is disabled in the Supabase Auth project setting; this must be enabled in the Supabase dashboard.

Added and applied `supabase/migrations/20260809120000_harden_backfill_function_search_path.sql`. Production verification confirms the maintenance function now uses `search_path=public, pg_temp`.

The Supabase dashboard was checked directly. Leaked-password protection cannot be saved on the current Free plan; Supabase returned: “Configuring leaked password protection via HaveIBeenPwned.org is available on Pro Plans and up.” No Auth setting was changed.

## Accessibility hygiene pass — 2026-08-09

Added explicit `type="button"` to all 690 previously untyped buttons across the static HTML surfaces. A form-context audit found none of the affected buttons inside forms, so submit behavior was not altered. The button-type count is now zero, and Forge/UI regression checks pass.

## CI guardrails pass — 2026-08-09

Added two automated release checks. `scripts/build/build-content-status.js --check` now compares the generated page/subject contract with the committed `data/content-status.json` while ignoring only its timestamp, so stale content metadata fails the build. `scripts/checks/check-button-types.js` scans the maintained HTML sources and fails any button without an explicit type. Both checks are available through npm scripts and run in the GitHub Pages workflow. The new button lint also caught six untyped controls in the reusable GCSE subject template; those template controls are now explicit as well.

## Entitlement hardening pass — 2026-08-09

Fixed the Pro login path in `forge-quiz.html`. It previously accepted any subscriber row and marked the session as Pro, including an expired trial. It now accepts only `pro` or unexpired `trial` access, gives expired trials a subscription message, signs them out, and persists accurate Pro/trial flags in local storage. Forge regression and UI-system checks pass.

## Live teacher-entry verification — 2026-08-09

- Teacher sign-in page loads with navigation, FAQ/privacy/pilot links, sign-in mode, and create-account mode.
- Empty sign-in submission returns a clear email/password validation message.
- Invalid credentials return a user-safe error without exposing provider details.
- Create-account mode exposes email, password, and school invite-code fields.
- Empty account creation returns validation before attempting account creation.
- No teacher account or class was created during this pass.

Class Mode’s unauthenticated guard also worked, but its currently deployed legacy sidebar still exposed a `settings.html` link. The compatibility route now preserves the correct destination by sending a signed-in teacher to `teacher-settings.html` and other users to the student Profile route.

## Trial/payment honesty pass — 2026-08-09

The signup flow was using a `paid=1` URL state and Stripe-return wording even though the implementation only created the account and started the 7-day trial; no Stripe checkout handoff or payment confirmation was present in this path. Removed the unused payment-link constant, changed the internal state to `trial=1`, and updated the comments so the confirmation is explicitly a trial-start confirmation. Billing remains a separate, unimplemented integration and is not represented as completed.

The Forge regression suite, UI-system checks, diff whitespace check, and stale Stripe-marker scan all pass after this change.

## Public metadata consistency pass — 2026-08-09

Added canonical links to all 37 public pages that expose `og:url`, including the homepage and subject marketing pages. Each canonical URL now matches the page’s `og:url`; the reusable GCSE template retains its `{{SLUG}}` placeholder. This reduces duplicate-URL ambiguity for search engines and keeps social/share metadata aligned.

Forge regression, UI-system, and whitespace checks pass after the metadata update.

## Authenticated teacher workflow pass — 2026-08-09

The deployed teacher entry page was opened and its sign-in/create-account modes were exercised. A disposable teacher email was entered with an intentionally invalid invite code; the server-side validation rejected it with the user-safe message `Invite code not recognised. Check with your school.` No account was created and the browser reported no console errors.

The full teacher/class workflow remains blocked pending a valid school invite code. Production invite codes were not read or exposed during the audit. Once an authorized test code is available, the next live pass is to create the teacher, create a class, join it with the disposable student, test assignments and cross-user visibility, then remove the test data.

## Authenticated teacher/student workflow — completed 2026-08-09

Created a clearly labelled disposable invite, then used it to create a temporary teacher account. The teacher created `Audit Economics 2026`; a disposable student joined with the generated class code. One student practice response appeared in the teacher dashboard with the expected student count and 100% accuracy. The teacher then created and deleted a focused assignment for Supply & Demand.

Cleanup verification returned zero remaining rows for the invite, class, teacher account, and test student. The temporary response and assignment were also removed, and the browser returned to the teacher sign-in state.

The in-app browser shares authentication storage across tabs, so it cannot represent two simultaneously signed-in users in separate tabs. The workflow was therefore tested sequentially—teacher sign-in, student sign-out/join/response, then teacher sign-in/dashboard verification. A two-browser or isolated-context test runner is still required for concurrent cross-user permission tests.
