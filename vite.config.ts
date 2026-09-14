import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

// Served from a GitHub Pages project sub-path, not the domain root — without
// this every asset URL resolves against / and 404s, leaving an unstyled page.
// Azure Static Web Apps serves from the root, so its workflow sets VITE_BASE=/.
// The router reads the result back through import.meta.env.BASE_URL.
export default defineConfig({
  base: process.env.VITE_BASE ?? "/vue-recipe-finder/",
  plugins: [vue()],
  test: {
    environment: "jsdom",
  },
});
