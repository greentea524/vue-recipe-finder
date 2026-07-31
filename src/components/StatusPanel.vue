<script setup lang="ts">
defineProps<{
  state: "loading" | "error" | "empty";
  message: string;
  hint?: string;
}>();

defineEmits<{ retry: [] }>();
</script>

<template>
  <div
    class="panel glass"
    :role="state === 'error' ? 'alert' : 'status'"
    aria-live="polite"
  >
    <div v-if="state === 'loading'" class="spinner" aria-hidden="true"></div>
    <p v-else class="icon" aria-hidden="true">
      {{ state === "error" ? "⚠️" : "🔍" }}
    </p>

    <p class="message">{{ message }}</p>
    <p v-if="hint" class="hint">{{ hint }}</p>

    <button
      v-if="state === 'error'"
      id="retry-button"
      type="button"
      class="retry"
      @click="$emit('retry')"
    >
      Try again
    </button>
  </div>
</template>

<style scoped>
.panel {
  display: grid;
  justify-items: center;
  gap: 0.6rem;
  padding: 3rem 1.5rem;
  text-align: center;
}

.icon {
  font-size: 1.75rem;
}

.message {
  font-size: 1.05rem;
  font-weight: 600;
}

.hint {
  color: var(--text-muted);
  font-size: 0.9rem;
  max-width: 34rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 3px solid var(--border-strong);
  border-top-color: var(--accent);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry {
  margin-top: 0.4rem;
  padding: 0.55rem 1.1rem;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-contrast);
  font-weight: 600;
  transition: transform 0.15s ease, filter 0.15s ease;
}

.retry:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
}
</style>
