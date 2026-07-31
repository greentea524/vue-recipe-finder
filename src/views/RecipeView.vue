<script setup lang="ts">
import { computed, watch } from "vue";
import { RouterLink } from "vue-router";
import StatusPanel from "../components/StatusPanel.vue";
import { useAsync } from "../composables/useAsync";
import { mealById } from "../api/mealdb";
import type { MealDetail } from "../api/types";

const props = defineProps<{ id: string }>();

const recipe = useAsync<MealDetail | null>();

function load(): void {
  void recipe.run((signal) => mealById(props.id, signal));
}

// Re-fetch when navigating straight from one recipe to another, which reuses
// this component rather than remounting it.
watch(() => props.id, load, { immediate: true });

const meal = computed(() => recipe.data.value);
</script>

<template>
  <nav class="back-nav" aria-label="Breadcrumb">
    <RouterLink id="back-to-search" to="/" class="back">
      <span aria-hidden="true">←</span> Back to search
    </RouterLink>
  </nav>

  <StatusPanel
    v-if="recipe.loading.value"
    state="loading"
    message="Loading recipe…"
  />

  <StatusPanel
    v-else-if="recipe.error.value"
    state="error"
    :message="recipe.error.value"
    hint="The recipe service may be temporarily unavailable."
    @retry="recipe.retry"
  />

  <StatusPanel
    v-else-if="!meal"
    state="empty"
    message="Recipe not found"
    hint="That recipe id doesn't exist. Try searching for something else."
  />

  <article v-else class="recipe">
    <header class="hero glass">
      <img
        class="hero-image"
        :src="meal.thumb"
        :alt="`Photo of ${meal.name}`"
        width="600"
        height="600"
      />
      <div class="hero-body">
        <h1 id="recipe-title" class="title">{{ meal.name }}</h1>
        <p class="meta">
          <span v-if="meal.category" class="badge">{{ meal.category }}</span>
          <span v-if="meal.area" class="badge subtle">{{ meal.area }}</span>
        </p>
        <p v-if="meal.sourceUrl" class="source">
          <a
            id="recipe-source-link"
            :href="meal.sourceUrl"
            target="_blank"
            rel="noreferrer"
            >Original source</a
          >
        </p>
      </div>
    </header>

    <div class="columns">
      <section class="ingredients glass" aria-labelledby="ingredients-heading">
        <h2 id="ingredients-heading">Ingredients</h2>
        <ul v-if="meal.ingredients.length" class="ingredient-list">
          <li
            v-for="ingredient in meal.ingredients"
            :key="ingredient.name"
            class="ingredient"
          >
            <span class="ingredient-name">{{ ingredient.name }}</span>
            <span v-if="ingredient.measure" class="measure">{{
              ingredient.measure
            }}</span>
          </li>
        </ul>
        <p v-else class="muted">No ingredients listed for this recipe.</p>
      </section>

      <section class="instructions" aria-labelledby="instructions-heading">
        <h2 id="instructions-heading">Instructions</h2>
        <ol v-if="meal.instructions.length" class="steps">
          <li v-for="(step, index) in meal.instructions" :key="index">
            {{ step }}
          </li>
        </ol>
        <p v-else class="muted">No instructions listed for this recipe.</p>
      </section>
    </div>

    <section
      v-if="meal.youtubeEmbedUrl"
      class="video"
      aria-labelledby="video-heading"
    >
      <h2 id="video-heading">Watch it made</h2>
      <div class="video-frame glass">
        <iframe
          id="recipe-video"
          :src="meal.youtubeEmbedUrl"
          :title="`Video recipe for ${meal.name}`"
          loading="lazy"
          allowfullscreen
          referrerpolicy="strict-origin-when-cross-origin"
        ></iframe>
      </div>
    </section>
  </article>
</template>

<style scoped>
.back-nav {
  margin-bottom: 1.25rem;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.15s ease, transform 0.15s ease;
}

.back:hover {
  color: var(--text);
  transform: translateX(-2px);
}

.recipe {
  display: grid;
  gap: 1.5rem;
}

.hero {
  display: grid;
  gap: 1.25rem;
  padding: 1.25rem;
  grid-template-columns: minmax(0, 15rem) minmax(0, 1fr);
  align-items: center;
}

.hero-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.title {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.85rem;
}

.badge {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-contrast);
  font-size: 0.8rem;
  font-weight: 650;
}

.badge.subtle {
  background: var(--surface-strong);
  border: 1px solid var(--border);
  color: var(--text);
}

.source {
  margin-top: 0.85rem;
  font-size: 0.9rem;
}

.columns {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
  align-items: start;
}

.ingredients {
  padding: 1.25rem;
}

.ingredients h2,
.instructions h2 {
  font-size: 1.1rem;
  margin-bottom: 0.85rem;
}

.ingredient-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.ingredient {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed var(--border);
  font-size: 0.925rem;
}

.ingredient:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.measure {
  color: var(--text-muted);
  white-space: nowrap;
}

.steps {
  display: grid;
  gap: 0.85rem;
  margin: 0;
  padding-left: 1.25rem;
  line-height: 1.65;
}

.muted {
  color: var(--text-muted);
  font-size: 0.925rem;
}

.video h2 {
  font-size: 1.1rem;
  margin-bottom: 0.85rem;
}

.video-frame {
  overflow: hidden;
  aspect-ratio: 16 / 9;
}

.video-frame iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

@media (max-width: 52rem) {
  .hero,
  .columns {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero-image {
    max-width: 18rem;
  }
}
</style>
