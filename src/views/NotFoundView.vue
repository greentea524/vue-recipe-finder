<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <section class="panel glass">
    <p class="icon" aria-hidden="true">🍽️</p>
    <h1>Page not found</h1>
    <p class="hint">
      That page doesn't exist. It may have been renamed or removed.
    </p>
    <RouterLink id="not-found-home-link" to="/" class="cta">
      Back to search
    </RouterLink>
  </section>
</template>

<style scoped>
.panel {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  padding: 4rem 1.5rem;
  text-align: center;
}

.icon {
  font-size: 2rem;
}

.hint {
  color: var(--text-muted);
  max-width: 30rem;
}

.cta {
  margin-top: 0.5rem;
  padding: 0.55rem 1.15rem;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-contrast);
  font-weight: 650;
  text-decoration: none;
  transition: transform 0.15s ease, filter 0.15s ease;
}

.cta:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
}
</style>
