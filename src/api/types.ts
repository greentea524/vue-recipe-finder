/** Raw meal record as TheMealDB returns it, with its 1..20 ingredient columns. */
export type RawMeal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string | null;
  strArea?: string | null;
  strInstructions?: string | null;
  strYoutube?: string | null;
  strSource?: string | null;
  [key: string]: string | null | undefined;
};

export type Ingredient = {
  name: string;
  measure: string;
};

/** A meal reduced to what a card needs. */
export type MealSummary = {
  id: string;
  name: string;
  thumb: string;
  category: string | null;
};

export type MealDetail = MealSummary & {
  area: string | null;
  instructions: string[];
  ingredients: Ingredient[];
  youtubeEmbedUrl: string | null;
  sourceUrl: string | null;
};

export type Category = {
  id: string;
  name: string;
};
