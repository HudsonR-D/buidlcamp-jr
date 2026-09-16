# Architecture and contracts
## Application
The React application is served through Workers static assets. Worker-first routing is limited to /api/*. Hash routes support static hosting and offline reopening. A content-hashed service worker precaches public app assets; /api/ requests are excluded. There is no Supabase dependency.

The schema-1 local workspace retains stable IDs and accepts earlier backups with absent newer fields. Reading support, age, and external-provider eligibility are separate concepts. localStorage holds active learning work; IndexedDB holds deliberately saved bounded checkpoints.

## Versioned exchange
- ProjectCheckpoint v1: allowlisted project fields, commit message, timestamp, selected milestone evidence.
- RepositoryBinding v1: repository ID, owner, name, default branch.
- Portfolio v2: submission identifier plus learner evidence and projects; legacy v1 import remains supported.
- Feedback v1: submission identifier, lesson/project references, educator text, timestamp. Imports must match an existing submission and its reference set.
- Assignment v1 and workspace schema 1 retain compatibility.

Only HTML and checkpoint metadata are committed under buidlcamp/projects/<id>/. Repository identity and revision are checked before operations. An outdated base or rejected non-fast-forward update returns a conflict. The local checkpoint remains available; load the remote version, compare, reconcile or import a separate project, then review a new commit. Restoration creates a new version; it does not rewrite history.

## Hosted routes
| Route | Purpose |
|---|---|
| GET /api/health | Public release marker |
| GET /api/status | Configuration and current session; no provider token |
| POST /api/github/connect | Eligible own-account acknowledgment; role; state/PKCE start |
| GET /api/github/callback | One-time state exchange; encrypted expiring session |
| GET /api/github/repos | Selected private writable repositories |
| GET /api/github/projects | Managed project IDs and current head |
| GET /api/github/history | Latest 20 project-affecting commits |
| GET /api/github/checkpoint | Read and validate inert source at a revision |
| POST /api/github/checkpoint | Allowlisted atomic version save |
| POST /api/github/disconnect | Invalidate session and attempt authorization revocation |
| POST /api/github/webhook | HMAC-verified authorization revocation |
| POST /api/ai | Authenticated adult BYOK demonstration |

D1 holds sessions, short-lived authorization flows, and rate limits only. GitHub user tokens are encrypted using AES-GCM. Refresh tokens are discarded. Sessions last at most eight hours; authorization starts expire after ten minutes. Cookies are opaque, Secure, HttpOnly and SameSite=Lax.

The AI provider interface supplies fixed endpoints, an educator instruction, 12,000-character prompts, at most 800 output tokens, bounded response bytes, 25-second timeout, cancellation, and rate/concurrency controls. Models are supplied by the adult because account availability varies. Subscription handoff is the default option.

## Design
Retain the established calm sidebar, broad work area, mint learning panel, readable typography, and project-first studio. Dark mode uses semantic tokens; CodeMirror reconfigures a theme compartment to preserve code, selection, and undo. New version controls and milestone panels extend the existing design. Theme preference is applied by an external synchronous bootstrap before first paint, follows system changes, and uses a light print palette.
