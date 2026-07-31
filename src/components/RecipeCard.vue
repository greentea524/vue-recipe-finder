<script setup lang="ts">
import { RouterLink } from "vue-router";
import type { MealSummary } from "../api/types";

defineProps<{ meal: MealSummary }>();
</script>

<template>
  <article class="card glass">
    <RouterLink
      :id="`recipe-link-${meal.id}`"
      :to="`/recipe/${meal.id}`"
      class="card-link"
    >
      <img
        class="thumb"
        :src="meal.thumb"
        :alt="`Photo of ${meal.name}`"
        loading="lazy"
        width="400"
        height="400"
      />
      <div class="body">
        <h3 class="name">{{ meal.name }}</h3>
        <p v-if="meal.category" class="category">{{ meal.category }}</p>
      </div>
    </RouterLink>
  </article>
</template>

<style scoped>
.card {
  overflow: hidden;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.card:hover {
  transform: translateY(-4px);
  border-color: var(--border-strong);
  box-shadow: var(--shadow);
}

.card-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.thumb {
  aspect-ratio: 1 / 1;
  width: 100%;
  height: auto;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.card:hover .thumb {
  transform: scale(1.04);
}

.body {
  display: grid;
  gap: 0.3rem;
  padding: 0.85rem 1rem 1.05rem;
}

.name {
  font-size: 1rem;
  font-weight: 650;
}

.category {
  color: var(--text-muted);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
</style>
