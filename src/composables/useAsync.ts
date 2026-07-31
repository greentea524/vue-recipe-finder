import { ref, shallowRef, type Ref } from "vue";

type Runner<T> = (signal: AbortSignal) => Promise<T>;

/**
 * Runs an async task while tracking loading and error state, and aborts the
 * previous run when a new one starts.
 *
 * The abort matters for the debounced search: without it a slow early request
 * can resolve after a later one and overwrite the newer results, and a request
 * cancelled on purpose would surface to the user as a failure.
 */
export function useAsync<T>() {
  const data = shallowRef<T | null>(null) as Ref<T | null>;
  const loading = ref(false);
  const error = ref<string | null>(null);

  let controller: AbortController | null = null;
  let lastRunner: Runner<T> | null = null;

  async function run(runner: Runner<T>): Promise<void> {
    lastRunner = runner;
    controller?.abort();
    controller = new AbortController();
    const { signal } = controller;

    loading.value = true;
    error.value = null;

    try {
      const result = await runner(signal);
      if (signal.aborted) return;
      data.value = result;
    } catch (cause) {
      if (signal.aborted) return;
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      error.value =
        cause instanceof Error ? cause.message : "Something went wrong.";
    } finally {
      if (!signal.aborted) loading.value = false;
    }
  }

  /** Re-runs the most recent task — the retry affordance on error states. */
  function retry(): void {
    if (lastRunner) void run(lastRunner);
  }

  return { data, loading, error, run, retry };
}
