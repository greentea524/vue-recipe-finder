<script setup lang="ts">
const model = defineModel<string>({ required: true });

defineEmits<{ surprise: [] }>();

defineProps<{ surprisePending: boolean }>();
</script>

<template>
  <form class="search glass" role="search" @submit.prevent>
    <label class="visually-hidden" for="search-input">Search recipes</label>
    <span class="icon" aria-hidden="true">🔎</span>
    <input
      id="search-input"
      v-model="model"
      type="search"
      name="q"
      placeholder="Search recipes — try “chicken”"
      autocomplete="off"
      class="input"
    />

    <button
      v-if="model !== ''"
      id="clear-search-button"
      type="button"
      class="clear"
      aria-label="Clear search"
      @click="model = ''"
    >
      ×
    </button>

    <button
      id="surprise-button"
      type="button"
      class="surprise"
      :disabled="surprisePending"
      @click="$emit('surprise')"
    >
      {{ surprisePending ? "Finding…" : "Surprise me" }}
    </button>
  </form>
</template>

<style scoped>
.search {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.6rem 0.55rem 0.95rem;
}

.icon {
  font-size: 1rem;
  opacity: 0.85;
}

.input {
  flex: 1;
  min-width: 0;
  padding: 0.55rem 0;
  border: 0;
  background: transparent;
  color: var(--text);
  font-size: 1rem;
  outline: none;
}

.input::placeholder {
  color: var(--text-muted);
}

.clear {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  font-size: 1.35rem;
  line-height: 1;
  padding: 0 0.25rem;
  border-radius: 999px;
}

.clear:hover {
  color: var(--text);
}

.surprise {
  flex-shrink: 0;
  padding: 0.55rem 1rem;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-contrast);
  font-weight: 650;
  white-space: nowrap;
  transition:
    transform 0.15s ease,
    filter 0.15s ease;
}

.surprise:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.06);
}

.surprise:disabled {
  opacity: 0.7;
  cursor: progress;
}

@media (max-width: 30rem) {
  .search {
    flex-wrap: wrap;
  }

  .input {
    flex-basis: 60%;
  }

  .surprise {
    flex: 1;
  }
}
</style>
