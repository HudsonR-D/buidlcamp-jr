# Release evidence

This record distinguishes implementation checks from live services and human validation. Updated 2026-09-16. The reviewed MIT source is public and the production domain is independently verified. The human/device/provider gaps below remain open.

## Local acceptance

- 50 lessons (40 preserved identifiers plus 10 Build Together), 16 prompt workshops, six starter projects, three editable labs, and the AI classifier are inventoried in `PROGRAM_REVIEW.md`.
- 35 unit/integration tests cover strict checkpoint allowlists, hostile IDs, secret patterns, private/selected repository enforcement, atomic commits, stale-head conflicts, encrypted sessions, OAuth state/PKCE, expiry/revocation, CSRF, AI relay limits, and IndexedDB retention (20/project and 50 MB total).
- Chromium, Firefox, and WebKit automation covers starter previews, learning/assignment/portfolio/feedback/revision, inert imports, theme persistence, CodeMirror selection/undo, checkpoints, lab transfers, responsive layouts, and offline reopening after the origin server stops. Provider/GitHub transport in these tests is mocked.
- Automated WCAG A/AA checks across all main views in both themes passed after correcting starter-number contrast, inline link distinction, and editor focus. Keyboard skip navigation and 320px reflow passed; this is not a complete human WCAG audit.
- Fresh installation and schema-1 backup migration are exercised. Backups retain stable lesson/project identifiers. Imported code executes only after Run preview.

## Live acceptance

- Staging: `https://buidlcamp-jr-staging.hudsonr3d.workers.dev`; first deployment `090363a1-1612-44a9-ab95-e2df5fe2bb3b`. HTTPS, health response, and static security headers independently checked. Live acceptance version `42ebb7af-537a-4820-82fc-c340c853ab54` passed real GitHub authorization, saving, and recovery.
- DNS inspection: `hudsonrnd.com` uses Cloudflare; a proxied wildcard pointed to `uixie.porkbun.com`; no explicit `buidl` record or existing Worker route was found before attachment. Unrelated DNS must remain unchanged.
- GitHub App integration: separate staging and production Apps registered with code read/write and metadata read, each installed on only the synthetic private fixture. Eight-hour user-token expiry confirmed for both Apps. Real state/PKCE authorization and a two-file atomic private checkpoint succeeded. Three consecutive commits (`c5156197`, `2bb838de`, `03f7078d`) preserved the initial README. A concurrent second browser tab caused a real stale-head conflict; reconciliation preserved both versions and restored the earlier content through a new commit. History comparison and inert import succeeded. Disconnect left zero D1 sessions. These were concurrent tabs, not two physical devices; public-visibility changes, expired sessions, revoked access, and CSRF are covered by simulated transport tests.
- Live testing found and fixed unsupported Cloudflare `redirect: error`: all credential-bearing transports now use `manual` and reject redirects. Added regression checks; no credentials are forwarded to redirect destinations.
- Public source: https://github.com/HudsonR-D/buidlcamp-jr, fresh history from an explicit reviewed file list. GitHub recognizes MIT; `HudsonR-D/BuidlCamp-Junior` remains private. A clean clone installed, built, and regenerated curriculum/license notices without differences. Gitleaks 8.30.1 found no recognizable secrets in source, new Git history, or production bundles; npm audit reported zero vulnerabilities.
- Production: https://buidl.hudsonrnd.com. Initial accepted application revision `86db327ff63e6a5b340fe3024bd821525db4af0e`; all four CI jobs passed in run `35111355000`. The authenticated production baseline is Worker version `1e462d45-56a1-449e-b61c-0552b846a8b0`, retained for rollback. `/api/health` identifies the currently deployed revision; subsequent release evidence and workflow runs are linked from GitHub Releases.
- Production GitHub OAuth, fixture-only selection, history read, inert import into a fresh workspace, explicit preview execution, and private save succeeded. Commit `e1a8ae5ee5625df94fbfd6e29548c176b79e4ccd` changed only checkpoint metadata because source HTML was unchanged. Disconnect was exercised.
- Independent HTTPS checks passed. Twenty-four non-HTML assets matched the clean build byte-for-byte. HTML was inspected separately: Cloudflare injects its same-origin bot-detection script. Hosting metadata/security behavior is disclosed in the privacy page. No unrelated DNS record was modified.
- Staging rollback was observed serving version `42ebb7af-537a-4820-82fc-c340c853ab54` (`acceptance-20260916`) before restoring and independently observing `79bbf4eb-28ad-4069-8366-ae12e314294e` (`86db327ff63e6a5b340fe3024bd821525db4af0e`). Edge propagation was allowed before asserting either result.
- Deployment credentials are separate, selected-Worker Editor tokens in main-only GitHub environments with a required maintainer reviewer. Tokens expire 2026-12-15 and must be rotated beforehand. Secret scanning, push protection, dependency checks, and private vulnerability reporting are enabled.

## Checks requiring people or external access

- Physical iPad in both orientations, touch/keyboard interruption, VoiceOver, installed/offline reopening, and interrupted saves: **not performed**. Browser WebKit/device dimensions do not substitute for a physical iPad.
- Supervised learner and educator walkthroughs, comprehension, engagement, and actual classroom differentiation: **not performed**. The curriculum register is an editorial/structural review, not a learning-outcome study.
- Paid live OpenAI/Anthropic responses with owner-supplied keys: **not performed**. Mocked success, invalid key, timeout, cancellation, and limits do not establish current paid-provider behavior.
- External certificate enrollment/issuer award: **not performed**. Official eligibility/cost/requirements sources were reviewed; BuidlCamp has no claimed partnership or authority to issue those credentials.

These gaps must remain visible in release notes. Do not describe the platform as independently certified, age verified, classroom validated, or fully tested on physical iPad on the basis of this record.
