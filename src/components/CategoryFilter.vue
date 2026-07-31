<script setup lang="ts">
import type { Category } from "../api/types";

const selected = defineModel<string | null>({ required: true });

defineProps<{ categories: Category[]; loading?: boolean }>();
</script>

<template>
  <!-- Rendered even while categories load, with placeholder chips holding the
       row's height. Popping this row in afterwards shifts the whole results
       section down, which was the single largest source of layout shift. -->
  <nav class="filter" aria-label="Filter by category">
    <ul v-if="loading" class="list" aria-hidden="true">
      <li v-for="n in 6" :key="n" class="chip placeholder"></li>
    </ul>

    <ul v-else class="list">
      <li>
        <button
          id="category-all"
          type="button"
          class="chip"
          :class="{ active: selected === null }"
          :aria-pressed="selected === null"
          @click="selected = null"
        >
          All
        </button>
      </li>
      <li v-for="category in categories" :key="category.id">
        <button
          :id="`category-${category.name.toLowerCase()}`"
          type="button"
          class="chip"
          :class="{ active: selected === category.name }"
          :aria-pressed="selected === category.name"
          @click="selected = selected === category.name ? null : category.name"
        >
          {{ category.name }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.filter {
  overflow-x: auto;
  /* Keeps the row on one scrollable line instead of overflowing the page. */
  scrollbar-width: thin;
}

.list {
  display: flex;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0.15rem 0 0.5rem;
}

.chip {
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-muted);
  font-size: 0.875rem;
  white-space: nowrap;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease;
}

.chip:hover {
  color: var(--text);
  border-color: var(--border-strong);
  transform: translateY(-1px);
}

.chip.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-contrast);
  font-weight: 650;
}

/* Same box as a real chip so the row's height is identical before and after. */
.chip.placeholder {
  width: 5.5rem;
  height: 2.1rem;
  opacity: 0.5;
  cursor: default;
}
</style>
