/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Overrides TheMealDB base URL, e.g. to point at a local stub. */
  readonly VITE_MEALDB_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
