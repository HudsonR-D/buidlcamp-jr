# BuidlCamp
Self-paced coding and AI learning for ages 10+, with account-free core learning and a portable workspace for families and educators.

- 50 lessons across Code Craft, AI Explorer, Game Design, and Build Together. Guided explanations, worked examples, hints, and extensions keep reading support independent of age.
- Six editable starters, three creative labs, a small classifier experiment, and four project capstones. No competitive rankings or streak penalties.
- 16 prompt workshops. Eligible learners can use subscriptions in the provider's own app; adults can optionally demonstrate APIs through the hosted relay or local companion.
- Private GitHub project checkpoints with explicit review, commit messages, comparison, import, and restoration. Daily edits remain local.
- Portable assignments, submission-linked educator feedback, revisions, printable plans, and rubrics.
- System, Light, and Dark themes; responsive desktop and tablet layouts; offline reopening after a successful online load.

Core learning needs no account or Supabase. GitHub and AI integrations are optional. A local completion is not an independently verified grade. Outside credentials are issued by their providers, without any BuidlCamp partnership claim.

## Run
Use Node.js 24 LTS.
```sh
cd app
npm ci
npm run dev
```
For a production build and the local-only adult API companion:
```sh
npm run build
npm start
```
Open http://127.0.0.1:4174. The companion binds only to loopback. GitHub sessions require the hosted Worker.

## Check
```sh
npm test
npm run lint
npm run build
npx playwright install chromium firefox webkit
npm run test:browser
npm run test:release
```
Set BUIDLCAMP_BROWSER to firefox or webkit to run the same browser suites in those engines. API and GitHub tests use fixture transports unless the release evidence explicitly records a live check.

See [architecture](docs/ARCHITECTURE.md), [deployment](docs/DEPLOYMENT.md), [program review](docs/PROGRAM_REVIEW.md), [release evidence](docs/RELEASE_EVIDENCE.md), and [privacy](PRIVACY.md).

## Licensing
The platform source is [MIT licensed](LICENSE). Runtime dependencies retain their [notices](THIRD_PARTY_NOTICES.md). Learners retain their rights in their work; exporting or saving a checkpoint does not automatically assign it an MIT license. Included starter code remains MIT; third-party materials added by learners keep their own terms.
