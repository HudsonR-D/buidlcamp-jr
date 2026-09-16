# Security
Report security issues privately through GitHub's “Report a vulnerability” feature for this repository. Do not publish keys, learner records, executable exploit attachments, or private repositories in issues.

The supported release is the current main branch. Include the affected revision, a minimal synthetic reproduction, impact, and the relevant boundary. We will assess reports; no fixed response-time guarantee is made.

## Boundaries
- Core learner data stays local. A PIN is a local convenience control, not authentication.
- Imported HTML remains inert until Run preview and runs in a sandbox without same-origin privileges or network access.
- GitHub operations require an expiring session, live selected-repository authorization, private visibility, bounded inputs, and reviewed allowlisted files. Writes update a base tree atomically and never force-push.
- Mutations require same-origin requests and a CSRF token (authorization start uses same-origin checks plus state/PKCE).
- Provider endpoints are fixed, requests are limited, and keys are not persisted or logged.
- No public issues, telemetry, fixtures, or CI artifacts may contain learner or account secrets.

## Release practice
Review the explicit release file list, dependency licenses, new Git history, and generated bundles before publishing. Secret scans complement manual review; they do not prove absence of every credential. If a genuine secret is exposed, revoke/rotate it at its issuer and assess use before removing it from files/history.

Pull-request CI has read-only repository access and no deployment credentials. Deployments run only from main through protected staging/production environments. Do not add pull_request_target execution of contributor code. Require an environment review before granting production secrets and retain the previous Cloudflare version for rollback.
