<script setup lang="ts">
/**
 * Placeholder cards shaped exactly like real ones. Swapping a generic spinner
 * for content of a different height is what drives layout shift on this page,
 * so the loading state occupies the same space the results will.
 */
withDefaults(defineProps<{ count?: number }>(), { count: 8 });
</script>

<template>
  <ul class="grid" aria-hidden="true">
    <li v-for="n in count" :key="n" class="card glass">
      <div class="thumb shimmer"></div>
      <div class="body">
        <div class="line shimmer"></div>
        <div class="line short shimmer"></div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
}

.card {
  overflow: hidden;
}

.thumb {
  aspect-ratio: 1 / 1;
  width: 100%;
}

.body {
  display: grid;
  gap: 0.5rem;
  padding: 0.85rem 1rem 1.05rem;
}

.line {
  height: 0.9rem;
  border-radius: 4px;
}

.line.short {
  width: 45%;
  height: 0.7rem;
}

.shimmer {
  background: linear-gradient(
    100deg,
    rgb(255 255 255 / 6%) 30%,
    rgb(255 255 255 / 13%) 50%,
    rgb(255 255 255 / 6%) 70%
  );
  background-size: 220% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  from {
    background-position: 180% 0;
  }
  to {
    background-position: -40% 0;
  }
}
</style>
