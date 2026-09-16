# Deploy BuidlCamp

The React assets and `/api/*` routes run in one Cloudflare Worker. D1 contains integration sessions, short-lived OAuth flows, and rate limits, never learner projects. Staging and production use separate Workers, D1 databases, GitHub Apps, and secrets.

## Local development

Use Node 24. From `app`, run `npm ci`, `npm run build`, and `npm start` for the local companion, or `npx wrangler dev` for the Worker. Copy `.dev.vars.example` to `.dev.vars` only when configuring an integration. Never commit that file. Local core learning works without credentials.

## Operator setup

1. Fork or clone this repository. Set your own account, database IDs, Worker names, and exact `APP_ORIGIN` values in `app/wrangler.jsonc`.
2. Create one D1 database per environment. Apply `worker/migrations` with `npx wrangler d1 migrations apply DB --remote --env staging`; omit the environment flag for production.
3. Register separate GitHub Apps with **Contents: read/write** and **Metadata: read** only. Keep expiring user access tokens enabled. Use the environment origin plus `/api/github/callback` as the exact callback, `/api/github/webhook` as the webhook, and `/#/versions` as the setup page. Enable SSL verification. Request no repository administration permission. Install for selected repositories only. Each repository must be private, writable, and initialized with a README.
4. Set Worker secrets `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_APP_URL`, `GITHUB_WEBHOOK_SECRET`, and `SESSION_KEY`. Generate `SESSION_KEY` from 32 random bytes encoded as base64. Use Wrangler secret input or an approved secret manager; never paste credentials into issues, source, shell command arguments, or logs. The App private key is not used by this user-token integration; keep any generated registration key securely in the operator's vault.
5. Build, test, then deploy staging with `npx wrangler deploy --env staging --var RELEASE:<git-sha>`. Verify its HTTPS page, `/api/health`, GitHub OAuth, selected repository operations, and offline shell before production.
6. Inspect DNS and existing Worker routes before attaching the exact production hostname. Do not replace the zone apex, wildcard, or unrelated product routes. Configure a Workers custom domain for the production hostname, then deploy the tested revision with `--var RELEASE:<git-sha>`.

## GitHub release workflow

**Current acceptance limitation (2026-09-16):** the configured selected-Worker Editor token was recognized as a valid account token, but Cloudflare returned authentication error 10000 for Wrangler 4.132.0 reading `/workers/services/buidlcamp-jr-staging`, on both the initial run and one retry. All preceding CI checks passed. The token scope was not expanded. Until this compatibility issue is resolved and an actual deployment succeeds, use the authorized operator Wrangler flow above; do not describe GitHub deployment automation as operational. See [the recorded workflow](https://github.com/HudsonR-D/buidlcamp-jr/actions/runs/35113595731) and [Cloudflare permission guidance](https://developers.cloudflare.com/workers/authorization/workers/).

`release.yml` only runs by manual dispatch from this repository's `main`. It builds and checks the same source before entering the selected protected GitHub environment. Configure environments named `staging` and `production`, restricted to `main`, with a required maintainer reviewer. Store a separate Cloudflare Account API token in each environment as `CLOUDFLARE_API_TOKEN`. Choose Specified Workers and Editor for only that environment's existing Worker. Set a 90-day expiry and rotate before expiry. The initial BuidlCamp tokens expire on 2026-12-15. This can deploy existing bindings and preserve an already attached custom domain; it does not need account-wide D1, DNS, or Worker administration. Provision databases, routes, and initial secrets separately with operator access. Do not use a personal Wrangler OAuth refresh token in CI. Fork pull requests receive no deployment secrets. CI workflows use read-only repository permissions and pinned actions.

## Rollback and recovery

Record the release Git SHA and Cloudflare deployment version in the release evidence. Before promoting a new release, retain the previous version and source lockfile. Use `npx wrangler deployments list` and `npx wrangler rollback <version-id>` (add `--env staging` for rehearsal). Independently check `/api/health` and the app after both rollback and re-promotion, allowing bounded time for edge propagation; the first response can still come from the previous version. A first deployment has no earlier version to restore: retain the accepted staging source and create a subsequent deployable version before claiming a rehearsed production rollback.

D1 migrations must remain compatible with the previous Worker until its rollback window closes. This initial migration adds tables only. On session-key rotation, invalidate existing session and auth-flow rows and require reconnection. On App-secret compromise, rotate at GitHub and Cloudflare and revoke affected authorizations; removing a secret from Git history is insufficient.

## Operational boundaries

Worker request logging is disabled. Do not add request bodies, cookies, credentials, learner code, AI prompts, or provider responses to logs or analytics. Cloudflare still processes hosting metadata. Sessions expire after at most eight hours and hourly cleanup removes expired session/flow/rate rows. Disconnect does not delete committed repository history. GitHub App revocation webhooks invalidate the affected user's sessions, and each repository operation rechecks current access and privacy.

Do not call staging or production acceptance complete from mocked transport tests alone. Record physical-device, provider, educator, and learner walkthrough gaps in `RELEASE_EVIDENCE.md`.
