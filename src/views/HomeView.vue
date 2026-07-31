<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import SearchBar from "../components/SearchBar.vue";
import CategoryFilter from "../components/CategoryFilter.vue";
import RecipeCard from "../components/RecipeCard.vue";
import StatusPanel from "../components/StatusPanel.vue";
import SkeletonGrid from "../components/SkeletonGrid.vue";
import { useAsync } from "../composables/useAsync";
import {
  listCategories,
  mealsByCategory,
  randomMeal,
  searchMeals,
} from "../api/mealdb";
import type { Category, MealSummary } from "../api/types";

const SEARCH_DEBOUNCE_MS = 300;

const router = useRouter();

const query = ref("");
const selectedCategory = ref<string | null>(null);
const surprisePending = ref(false);
const surpriseError = ref<string | null>(null);

const categories = useAsync<Category[]>();
const results = useAsync<MealSummary[]>();

let debounceTimer: ReturnType<typeof setTimeout> | undefined;

function loadResults(): void {
  const term = query.value.trim();
  const category = selectedCategory.value;

  if (term !== "") {
    // Search first, then narrow client-side: search results already carry a
    // category, so combining both filters costs no extra request.
    void results.run(async (signal) => {
      const meals = await searchMeals(term, signal);
      return category ? meals.filter((m) => m.category === category) : meals;
    });
    return;
  }

  if (category) {
    void results.run((signal) => mealsByCategory(category, signal));
    return;
  }

  // No query and no filter: an empty search term browses the whole collection.
  void results.run((signal) => searchMeals("", signal));
}

watch(query, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadResults, SEARCH_DEBOUNCE_MS);
});

// A category click is a deliberate action, so it applies immediately.
watch(selectedCategory, () => {
  clearTimeout(debounceTimer);
  loadResults();
});

onMounted(() => {
  void categories.run((signal) => listCategories(signal));
  loadResults();
});

onUnmounted(() => clearTimeout(debounceTimer));

async function surpriseMe(): Promise<void> {
  surprisePending.value = true;
  surpriseError.value = null;
  try {
    const meal = await randomMeal();
    await router.push(`/recipe/${meal.id}`);
  } catch (cause) {
    surpriseError.value =
      cause instanceof Error
        ? cause.message
        : "Could not fetch a random recipe.";
  } finally {
    surprisePending.value = false;
  }
}

const meals = computed(() => results.data.value ?? []);

const heading = computed(() => {
  const term = query.value.trim();
  if (term && selectedCategory.value) {
    return `“${term}” in ${selectedCategory.value}`;
  }
  if (term) return `Results for “${term}”`;
  if (selectedCategory.value) return selectedCategory.value;
  return "Browse recipes";
});
</script>

<template>
  <h1 class="visually-hidden">Recipe Finder</h1>

  <SearchBar
    v-model="query"
    :surprise-pending="surprisePending"
    @surprise="surpriseMe"
  />

  <p v-if="surpriseError" id="surprise-error" class="surprise-error" role="alert">
    {{ surpriseError }}
  </p>

  <CategoryFilter
    v-model="selectedCategory"
    :categories="categories.data.value ?? []"
    :loading="categories.loading.value"
    class="filter-row"
  />

  <section aria-labelledby="results-heading" class="results">
    <div class="results-head">
      <h2 id="results-heading">{{ heading }}</h2>
      <p v-if="!results.loading.value && !results.error.value" class="count">
        {{ meals.length }} {{ meals.length === 1 ? "recipe" : "recipes" }}
      </p>
    </div>

    <SkeletonGrid v-if="results.loading.value" :count="8" />

    <StatusPanel
      v-else-if="results.error.value"
      state="error"
      :message="results.error.value"
      hint="The recipe service may be temporarily unavailable."
      @retry="results.retry"
    />

    <StatusPanel
      v-else-if="meals.length === 0"
      state="empty"
      message="No recipes found"
      hint="Try a different search term, or clear the category filter."
    />

    <ul v-else id="results-grid" class="grid">
      <li v-for="meal in meals" :key="meal.id">
        <RecipeCard :meal="meal" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.filter-row {
  margin-top: 1.1rem;
}

.results {
  margin-top: 1.5rem;
}

.results-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.results-head h2 {
  font-size: 1.25rem;
}

.count {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.surprise-error {
  margin-top: 0.75rem;
  color: var(--danger);
  font-size: 0.9rem;
}

.grid {
  display: grid;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
}
</style>
