# api-docs

Docusaurus static documentation site (private), deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to `main`. There is no runtime service, image or Dockerfile.

## Commit & release policy

Versions are automated by semantic-release from commit messages. Follow these rules.

- Conventional Commits only: `type(scope): subject`.
  - `feat:` -> minor. `fix:` / `perf:` / `revert:` -> patch.
  - `!` after the type, or a `BREAKING CHANGE:` footer -> major.
  - `docs` / `test` / `chore` / `refactor` / `ci` / `build` / `style` -> no release.
  - `feat(scope):` style scopes are allowed.
- Squash-merge: the PR title MUST be a Conventional Commit. It becomes the commit on `main` and is the release input.
- A breaking change in a squash merge needs `!` in the PR title. A `BREAKING CHANGE:` footer only counts if it ends up in the squash commit body.
- NEVER edit `version` in `package.json`, or the root version in `package-lock.json`, by hand.
- NEVER run `npm version`.
- NEVER create release tags (`v*`) by hand. Agents never create release tags.
- The ONE-TIME baseline tag `v1.0.0` (the current `package.json` version) on `main` is created by the operator (gate D) before merging this change. It is the cutoff: history before it (including junk commits such as `alota`) is never analyzed.
- NEVER force-push or bypass protected branches.
- Releases run only from `main` via `.github/workflows/release.yml`.
- The release bot pushes a `chore(release): x.y.z` commit that bumps `package.json` + `package-lock.json`, then tags `vX.Y.Z` and creates a GitHub Release. That commit re-triggers the Pages deploy, which is intended.
- Do not publish to npm.
- Git writes follow the workspace git-guard rules (use the `git-guard` MCP, never push from an agent).
