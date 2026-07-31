# vue-recipe-finder

A recipe search app built with Vue 3's Composition API and Vite, backed by the
free [TheMealDB](https://www.themealdb.com/api.php) API. Search by name, filter
by category, and open a full recipe with ingredients, instructions, and video.

Live at **https://greentea524.github.io/vue-recipe-finder/**

Tracked as [KAN-65](https://gtea524.atlassian.net/browse/KAN-65).

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
| Hosting   | GitHub Pages                          |

There is no backend. TheMealDB's v1 endpoint needs no key, so the browser calls
it directly and nothing secret is involved.

## Development

```bash
npm install
npm run dev     # http://localhost:5173/vue-recipe-finder/
npm test
npm run build   # writes dist/, including the SPA fallback
```

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

`.github/workflows/build-and-deploy.yml` runs on every push to `main`: install,
test, build, verify the SPA fallback, then publish `dist/` via
`actions/deploy-pages`, authenticating with the built-in `GITHUB_TOKEN`. Pages
must be enabled once under Settings → Pages → Source: GitHub Actions.

Three settings make this work on a project sub-path, and all three must agree
on `/vue-recipe-finder/`:

- **`base` in `vite.config.ts`** — otherwise every asset URL resolves against
  the domain root and 404s, leaving an unstyled page.
- **`createWebHistory(BASE)` in `src/router/index.ts`** — otherwise assets load
  but in-app navigation builds URLs against the root, a half-broken state that
  is easy to misdiagnose.
- **`scripts/spa-fallback.mjs`** — copies the built `index.html` to `404.html`.
  GitHub Pages has no rewrite rules, so a cold request for
  `/vue-recipe-finder/recipe/52772` would otherwise return a 404 page. Pages
  serves `404.html` for unmatched paths while preserving the URL, so the app
  boots and the router resolves the route on the client. The workflow asserts
  the file exists rather than trusting the step silently ran.

Unknown routes still reach the app's own not-found view, so a genuinely bad
path looks intentional rather than broken.

## Configuration

`VITE_MEALDB_BASE` overrides TheMealDB's base URL at build time, which lets the
app run against a local stub for offline work and auditing. Production builds
omit it and use the real endpoint.

## Out of scope

No favourites or saved recipes, no pagination, no auth, no backend, no
server-side rendering.
