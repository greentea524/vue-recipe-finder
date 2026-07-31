import { toDetail, toSummary } from "./transform";
import type { Category, MealDetail, MealSummary, RawMeal } from "./types";

/**
 * TheMealDB's free v1 endpoint. Overridable at build time via
 * VITE_MEALDB_BASE so the app can be pointed at a local stub for auditing and
 * offline runs; production builds use the default.
 */
const BASE =
  import.meta.env.VITE_MEALDB_BASE ?? "https://www.themealdb.com/api/json/v1/1";

/** Thrown for anything the UI should surface with a retry affordance. */
export class MealDbError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MealDbError";
  }
}

type MealsResponse = { meals: RawMeal[] | null };
type CategoriesResponse = {
  categories: { idCategory: string; strCategory: string }[] | null;
};

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE}${path}`, { signal });
  } catch (error) {
    // Re-throw aborts untouched so a superseded request isn't shown as an error.
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new MealDbError(
      "Could not reach the recipe service. Check your connection and try again.",
    );
  }

  if (!response.ok) {
    throw new MealDbError(
      `The recipe service responded with ${response.status}. Please try again.`,
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new MealDbError("The recipe service returned an unreadable response.");
  }
}

/** TheMealDB returns `meals: null` rather than an empty array for no results. */
export async function searchMeals(
  query: string,
  signal?: AbortSignal,
): Promise<MealSummary[]> {
  const data = await get<MealsResponse>(
    `/search.php?s=${encodeURIComponent(query)}`,
    signal,
  );
  return (data.meals ?? []).map((meal) => toSummary(meal));
}

export async function mealsByCategory(
  category: string,
  signal?: AbortSignal,
): Promise<MealSummary[]> {
  const data = await get<MealsResponse>(
    `/filter.php?c=${encodeURIComponent(category)}`,
    signal,
  );
  // This endpoint omits the category, so carry the filtered one onto each card.
  return (data.meals ?? []).map((meal) => toSummary(meal, category));
}

export async function listCategories(
  signal?: AbortSignal,
): Promise<Category[]> {
  const data = await get<CategoriesResponse>("/categories.php", signal);
  return (data.categories ?? []).map((c) => ({
    id: c.idCategory,
    name: c.strCategory,
  }));
}

export async function mealById(
  id: string,
  signal?: AbortSignal,
): Promise<MealDetail | null> {
  const data = await get<MealsResponse>(
    `/lookup.php?i=${encodeURIComponent(id)}`,
    signal,
  );
  const meal = data.meals?.[0];
  return meal ? toDetail(meal) : null;
}

export async function randomMeal(signal?: AbortSignal): Promise<MealDetail> {
  const data = await get<MealsResponse>("/random.php", signal);
  const meal = data.meals?.[0];
  if (!meal) {
    throw new MealDbError("The recipe service did not return a random recipe.");
  }
  return toDetail(meal);
}
