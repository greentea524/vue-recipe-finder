import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

// Served from a GitHub Pages project sub-path, not the domain root — without
// this every asset URL resolves against / and 404s, leaving an unstyled page.
// Must match the base passed to createWebHistory in src/router/index.ts.
export default defineConfig({
  base: "/vue-recipe-finder/",
  plugins: [vue()],
  test: {
    environment: "jsdom",
  },
});
