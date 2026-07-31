import type {
  Ingredient,
  MealDetail,
  MealSummary,
  RawMeal,
} from "./types";

/**
 * Pure shaping of TheMealDB's responses. Kept apart from the fetch layer so the
 * fiddly parts — 20 flat ingredient columns, YouTube URL variants — are unit
 * tested directly rather than through the network.
 */

const MAX_INGREDIENTS = 20;

function clean(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Ingredients arrive as strIngredient1..20 paired with strMeasure1..20, padded
 * with empty strings and nulls. Rows without an ingredient name are dropped; a
 * missing measure is not a reason to drop an otherwise real ingredient.
 */
export function ingredientsOf(meal: RawMeal): Ingredient[] {
  const ingredients: Ingredient[] = [];

  for (let i = 1; i <= MAX_INGREDIENTS; i += 1) {
    const name = clean(meal[`strIngredient${i}`]);
    if (name === "") continue;
    ingredients.push({ name, measure: clean(meal[`strMeasure${i}`]) });
  }

  return ingredients;
}

/**
 * Turns a watch URL into an embeddable one. TheMealDB stores plain watch links,
 * and some records carry youtu.be short links or an empty string.
 */
export function youtubeEmbedUrl(
  value: string | null | undefined,
): string | null {
  const raw = clean(value);
  if (raw === "") return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  let id: string | null = null;
  if (url.hostname.endsWith("youtu.be")) {
    id = url.pathname.slice(1);
  } else if (url.pathname === "/watch") {
    id = url.searchParams.get("v");
  } else if (url.pathname.startsWith("/embed/")) {
    id = url.pathname.slice("/embed/".length);
  }

  return id ? `https://www.youtube.com/embed/${id}` : null;
}

/** Splits TheMealDB's single instructions blob into paragraphs. */
export function instructionsOf(meal: RawMeal): string[] {
  return clean(meal.strInstructions)
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

/**
 * The filter-by-category endpoint returns only id, name, and thumbnail — no
 * category field — so the caller supplies the category it filtered on, keeping
 * cards complete without a second request per meal.
 */
export function toSummary(
  meal: RawMeal,
  fallbackCategory: string | null = null,
): MealSummary {
  return {
    id: meal.idMeal,
    name: meal.strMeal,
    thumb: meal.strMealThumb,
    category: clean(meal.strCategory) || fallbackCategory,
  };
}

export function toDetail(meal: RawMeal): MealDetail {
  return {
    ...toSummary(meal),
    area: clean(meal.strArea) || null,
    instructions: instructionsOf(meal),
    ingredients: ingredientsOf(meal),
    youtubeEmbedUrl: youtubeEmbedUrl(meal.strYoutube),
    sourceUrl: clean(meal.strSource) || null,
  };
}
