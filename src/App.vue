<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header">
    <div class="container header-inner">
      <RouterLink id="brand-link" to="/" class="brand">
        <span aria-hidden="true" class="brand-mark">🍲</span>
        <span>Recipe Finder</span>
      </RouterLink>
      <p class="tagline">Search thousands of recipes from TheMealDB</p>
    </div>
  </header>

  <main id="main" class="container site-main">
    <RouterView />
  </main>

  <footer class="site-footer">
    <div class="container">
      <p>
        Recipe data from
        <a
          id="footer-mealdb-link"
          href="https://www.themealdb.com"
          target="_blank"
          rel="noreferrer"
          >TheMealDB</a
        >.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.skip-link {
  position: absolute;
  left: 0.5rem;
  top: -3rem;
  z-index: 10;
  padding: 0.5rem 0.85rem;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: var(--accent-contrast);
  font-weight: 600;
  text-decoration: none;
  transition: top 0.15s ease;
}

.skip-link:focus {
  top: 0.5rem;
}

.site-header {
  border-bottom: 1px solid var(--border);
  background: rgb(11 16 32 / 55%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 5;
}

.header-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem 1rem;
  padding-block: 0.9rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text);
  text-decoration: none;
}

.brand-mark {
  font-size: 1.35rem;
}

.tagline {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.site-main {
  padding-block: 2rem 3rem;
}

.site-footer {
  border-top: 1px solid var(--border);
  padding-block: 1.25rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}
</style>
