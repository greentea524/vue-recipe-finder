# vue-recipe-finder

A recipe search app built with Vue 3's Composition API and Vite, backed by the
free [TheMealDB](https://www.themealdb.com/api.php) API. Search by name, filter
by category, and open a full recipe with ingredients, instructions, and video.

Live in two places, both deployed from `main` (see [Deployment](#deployment)):

- GitHub Pages: **https://greentea524.github.io/vue-recipe-finder/**
- Azure Static Web Apps: **https://zealous-rock-08fc77d10.6.azurestaticapps.net/**

Built under [KAN-65](https://gtea524.atlassian.net/browse/KAN-65); Azure
hosting added under [KAN-181](https://gtea524.atlassian.net/browse/KAN-181).

## Stack

| Layer     | Choice                                |
| --------- | ------------------------------------- |
| Framework | Vue 3 (`<script setup>`)              |
| Build     | Vite 8                                |
| Routing   | Vue Router 5                          |
| Data      | Fetch API against TheMealDB v1        |
| State     | `ref` / `shallowRef` — no store layer |
| Styling   | Vanilla CSS, dark glassmorphic theme  |
| Tests     | Vitest                                |
| Hosting   | GitHub Pages + Azure Static Web Apps  |

There is no backend. TheMealDB's v1 endpoint needs no key, so the browser calls
it directly and nothing secret is involved.

## Development

```bash
npm install
npm run dev     # http://localhost:5173/vue-recipe-finder/
npm test
npm run build   # writes dist/, including the SPA fallback
```

To build and preview the app the way Azure serves it, from the domain root:

```bash
VITE_BASE=/ npm run build
npx vite preview --base /   # http://localhost:4173/
```

In Git Bash on Windows, prefix both with `MSYS_NO_PATHCONV=1`. Otherwise the
shell rewrites `/` into a Windows path such as `/Program Files/Git/`, and the
build silently uses that as its base.

## How it works

`src/api/transform.ts` holds the pure reshaping of TheMealDB's responses, kept
separate from `src/api/mealdb.ts` so the fiddly parts are unit-tested without a
network. Two of them are worth knowing about:

**Ingredients arrive as 20 flat column pairs.** `strIngredient1..20` alongside
`strMeasure1..20`, padded with empty strings and nulls. Rows without a name are
dropped, but a missing *measure* is not a reason to drop a real ingredient —
"salt" with no quantity is still an ingredient.

**`filter.php` omits the category.** The filter-by-category endpoint returns
only id, name, and thumbnail, so a card built from it would render without the
category the ticket requires. Rather than issue a lookup per meal, the caller
stamps the category it filtered on onto each result.

`src/composables/useAsync.ts` tracks loading and error state and aborts the
previous request when a new one starts. That abort is what stops a slow early
search from resolving after a newer one and overwriting fresher results, and it
keeps a deliberately cancelled request from surfacing as an error.

## Deployment

Every push to `main` deploys the same commit to two hosts. Two workflows run in
parallel and don't depend on each other: if one fails, the other still
deploys. Each runs its own install and tests, so tests run twice per push.

|                  | GitHub Pages                              | Azure Static Web Apps                                   |
| ---------------- | ----------------------------------------- | ------------------------------------------------------- |
| URL              | `greentea524.github.io/vue-recipe-finder/` | `zealous-rock-08fc77d10.6.azurestaticapps.net/`         |
| Workflow         | `.github/workflows/build-and-deploy.yml`  | `.github/workflows/azure-static-web-apps.yml`           |
| Served from      | Sub-path `/vue-recipe-finder/`            | Domain root `/`                                         |
| Build            | `npm run build` (default base)            | `npm run build` with `VITE_BASE=/`                      |
| Deep-link rescue | `404.html`, a copy of `index.html`        | Rewrite rule in `public/staticwebapp.config.json`       |
| Auth             | Built-in `GITHUB_TOKEN`                   | Repo secret `AZURE_STATIC_WEB_APPS_API_TOKEN`           |
| Cost             | Free                                      | Free plan                                               |

Both builds contain both deep-link mechanisms; each host ignores the one meant
for the other.

### What makes the base path work

The app has to run both under `/vue-recipe-finder/` and at `/`, so nothing may
hardcode either path:

- **`base` in `vite.config.ts`** — otherwise every asset URL resolves against
  the wrong prefix and 404s, leaving an unstyled page. It defaults to
  `/vue-recipe-finder/` and is overridden with `VITE_BASE`.
- **`createWebHistory(import.meta.env.BASE_URL)` in `src/router/index.ts`** —
  otherwise assets load but in-app navigation builds URLs against the wrong
  prefix, a half-broken state that is easy to misdiagnose. Reading Vite's base
  means the router can't drift from it.

Anything new that builds a URL should also go through `import.meta.env.BASE_URL`.

### Deep links

A cold request for a client-side route like `/recipe/52772` has no matching
file, so each host needs a way to serve the app instead of a 404:

- **Pages** has no rewrite rules. `scripts/spa-fallback.mjs` copies the built
  `index.html` to `404.html`; Pages serves it for unmatched paths while keeping
  the URL, so the app boots and the router resolves the route on the client.
  The Pages workflow asserts the file exists rather than trusting the step ran.
- **Azure** supports rewrites. `staticwebapp.config.json`'s `navigationFallback`
  rewrites unmatched navigation requests to `/index.html`, excluding
  `/assets/*` so a missing bundle still returns a real 404.

Unknown routes still reach the app's own not-found view, so a genuinely bad
path looks intentional rather than broken.

### GitHub Pages setup

Enabled once under Settings → Pages → Source: GitHub Actions. The workflow
publishes `dist/` via `actions/deploy-pages` and retries once on a transient
Pages failure.

### Azure setup

The Static Web App was created in the Azure Portal on the **Free** plan with
**Deployment source: Other**, not GitHub. Choosing GitHub makes Azure commit a
second, generated workflow with its own build, which would ignore `VITE_BASE`
and skip the tests. Instead, the workflow here builds and tests itself and uses
`Azure/static-web-apps-deploy@v1` only to upload `dist/` (`skip_app_build`).

It authenticates with the resource's deployment token, stored as the repo
secret `AZURE_STATIC_WEB_APPS_API_TOKEN`. If the secret is missing, the workflow
skips the deploy with a notice instead of failing.

- **Rotating the token:** in Azure, open the Static Web App → Overview → Manage
  deployment token → Reset, then paste the new value into the GitHub secret.
- **Rebuilding the resource:** repeat the setup above. A new resource gets a
  new `*.azurestaticapps.net` hostname, so update the URL in this README.

### Dropping a host

- **Azure only:** delete `build-and-deploy.yml` and disable Pages. You can then
  default `base` to `/` and remove `scripts/spa-fallback.mjs`.
- **Pages only:** delete `azure-static-web-apps.yml`,
  `public/staticwebapp.config.json` and the secret, then delete the Static Web
  App in Azure.

## Configuration

`VITE_MEALDB_BASE` overrides TheMealDB's base URL at build time, which lets the
app run against a local stub for offline work and auditing. Production builds
omit it and use the real endpoint.

## Out of scope

No favourites or saved recipes, no pagination, no auth, no backend, no
server-side rendering.
