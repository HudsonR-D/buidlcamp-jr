# Release evidence

This record distinguishes implementation checks from live services and human validation. Updated 2026-09-16 during release preparation. Publication and production verification are still in progress until the final release entries below are filled.

## Local acceptance

- 50 lessons (40 preserved identifiers plus 10 Build Together), 16 prompt workshops, six starter projects, three editable labs, and the AI classifier are inventoried in `PROGRAM_REVIEW.md`.
- 35 unit/integration tests cover strict checkpoint allowlists, hostile IDs, secret patterns, private/selected repository enforcement, atomic commits, stale-head conflicts, encrypted sessions, OAuth state/PKCE, expiry/revocation, CSRF, AI relay limits, and IndexedDB retention (20/project and 50 MB total).
- Chromium, Firefox, and WebKit automation covers starter previews, learning/assignment/portfolio/feedback/revision, inert imports, theme persistence, CodeMirror selection/undo, checkpoints, lab transfers, responsive layouts, and offline reopening after the origin server stops. Provider/GitHub transport in these tests is mocked.
- Automated WCAG A/AA checks across all main views in both themes passed after correcting starter-number contrast, inline link distinction, and editor focus. Keyboard skip navigation and 320px reflow passed; this is not a complete human WCAG audit.
- Fresh installation and schema-1 backup migration are exercised. Backups retain stable lesson/project identifiers. Imported code executes only after Run preview.

## Live acceptance

- Staging: `https://buidlcamp-jr-staging.hudsonr3d.workers.dev`; first deployment `090363a1-1612-44a9-ab95-e2df5fe2bb3b`. HTTPS, health response, and static security headers independently checked. Live acceptance version `42ebb7af-537a-4820-82fc-c340c853ab54` passed real GitHub authorization, saving, and recovery.
- DNS inspection: `hudsonrnd.com` uses Cloudflare; a proxied wildcard pointed to `uixie.porkbun.com`; no explicit `buidl` record or existing Worker route was found before attachment. Unrelated DNS must remain unchanged.
- GitHub App integration: separate staging and production Apps registered with code read/write and metadata read, each installed on only the synthetic private fixture. Eight-hour user-token expiry confirmed for staging. Real state/PKCE authorization and a two-file atomic private checkpoint succeeded. Three consecutive commits (`c5156197`, `2bb838de`, `03f7078d`) preserved the initial README. A concurrent second browser tab caused a real stale-head conflict; reconciliation preserved both versions and restored the earlier content through a new commit. History comparison and inert import succeeded. Disconnect left zero D1 sessions. These were concurrent tabs, not two physical devices; public-visibility changes, expired sessions, revoked access, and CSRF are covered by simulated transport tests.
- Live testing found and fixed unsupported Cloudflare `redirect: error`: all credential-bearing transports now use `manual` and reject redirects. Added regression checks; no credentials are forwarded to redirect destinations.
- Public repository, release Git SHA, production version, independent domain checks, and rollback rehearsal: pending.

## Checks requiring people or external access

- Physical iPad in both orientations, touch/keyboard interruption, VoiceOver, installed/offline reopening, and interrupted saves: **not performed**. Browser WebKit/device dimensions do not substitute for a physical iPad.
- Supervised learner and educator walkthroughs, comprehension, engagement, and actual classroom differentiation: **not performed**. The curriculum register is an editorial/structural review, not a learning-outcome study.
- Paid live OpenAI/Anthropic responses with owner-supplied keys: **not performed**. Mocked success, invalid key, timeout, cancellation, and limits do not establish current paid-provider behavior.
- External certificate enrollment/issuer award: **not performed**. Official eligibility/cost/requirements sources were reviewed; BuidlCamp has no claimed partnership or authority to issue those credentials.

These gaps must remain visible in release notes. Do not describe the platform as independently certified, age verified, classroom validated, or fully tested on physical iPad on the basis of this record.
