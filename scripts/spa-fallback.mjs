// GitHub Pages serves 404.html for any path it has no file for, and does not
// support rewrites. Copying the built index.html there makes deep links like
// /vue-recipe-finder/recipe/52772 load the app instead of a 404 page; the URL
// is preserved, so Vue Router resolves the route on the client.
import { copyFileSync, existsSync } from "node:fs";

const from = "dist/index.html";
const to = "dist/404.html";

if (!existsSync(from)) {
  console.error(`spa-fallback: ${from} not found — did the build run?`);
  process.exit(1);
}

copyFileSync(from, to);
console.log(`spa-fallback: wrote ${to}`);
