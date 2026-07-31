import { describe, expect, it } from "vitest";
import {
  ingredientsOf,
  instructionsOf,
  toDetail,
  toSummary,
  youtubeEmbedUrl,
} from "./transform";
import type { RawMeal } from "./types";

function meal(overrides: Partial<RawMeal> = {}): RawMeal {
  return {
    idMeal: "52772",
    strMeal: "Teriyaki Chicken Casserole",
    strMealThumb: "https://example.test/thumb.jpg",
    ...overrides,
  };
}

describe("ingredientsOf", () => {
  it("pairs each ingredient with its measure", () => {
    expect(
      ingredientsOf(
        meal({
          strIngredient1: "soy sauce",
          strMeasure1: "3/4 cup",
          strIngredient2: "water",
          strMeasure2: "1/2 cup",
        }),
      ),
    ).toEqual([
      { name: "soy sauce", measure: "3/4 cup" },
      { name: "water", measure: "1/2 cup" },
    ]);
  });

  it("drops the empty-string and null padding the API sends", () => {
    expect(
      ingredientsOf(
        meal({
          strIngredient1: "rice",
          strMeasure1: "1 cup",
          strIngredient2: "",
          strMeasure2: "",
          strIngredient3: null,
          strMeasure3: null,
          strIngredient4: "   ",
          strMeasure4: "  ",
        }),
      ),
    ).toEqual([{ name: "rice", measure: "1 cup" }]);
  });

  it("keeps an ingredient whose measure is missing", () => {
    expect(
      ingredientsOf(meal({ strIngredient1: "salt", strMeasure1: "" })),
    ).toEqual([{ name: "salt", measure: "" }]);
  });

  it("reads all twenty columns but no further", () => {
    const wide: Partial<RawMeal> = {};
    for (let i = 1; i <= 25; i += 1) {
      wide[`strIngredient${i}`] = `item ${i}`;
      wide[`strMeasure${i}`] = `${i}g`;
    }
    const result = ingredientsOf(meal(wide));
    expect(result).toHaveLength(20);
    expect(result.at(-1)).toEqual({ name: "item 20", measure: "20g" });
  });

  it("returns an empty list when there are no ingredients at all", () => {
    expect(ingredientsOf(meal())).toEqual([]);
  });
});

describe("youtubeEmbedUrl", () => {
  it("converts a watch link", () => {
    expect(youtubeEmbedUrl("https://www.youtube.com/watch?v=4aZr5hZXP_s")).toBe(
      "https://www.youtube.com/embed/4aZr5hZXP_s",
    );
  });

  it("converts a youtu.be short link", () => {
    expect(youtubeEmbedUrl("https://youtu.be/4aZr5hZXP_s")).toBe(
      "https://www.youtube.com/embed/4aZr5hZXP_s",
    );
  });

  it("passes an already-embeddable link through", () => {
    expect(youtubeEmbedUrl("https://www.youtube.com/embed/4aZr5hZXP_s")).toBe(
      "https://www.youtube.com/embed/4aZr5hZXP_s",
    );
  });

  it("returns null for missing, blank, or unparseable values", () => {
    expect(youtubeEmbedUrl(null)).toBeNull();
    expect(youtubeEmbedUrl(undefined)).toBeNull();
    expect(youtubeEmbedUrl("")).toBeNull();
    expect(youtubeEmbedUrl("   ")).toBeNull();
    expect(youtubeEmbedUrl("not a url")).toBeNull();
  });

  it("returns null for a YouTube URL carrying no video id", () => {
    expect(youtubeEmbedUrl("https://www.youtube.com/watch")).toBeNull();
  });
});

describe("instructionsOf", () => {
  it("splits the blob into paragraphs and drops blank lines", () => {
    expect(
      instructionsOf(
        meal({ strInstructions: "Preheat.\r\n\r\nMix well.\n\n\nBake.\n" }),
      ),
    ).toEqual(["Preheat.", "Mix well.", "Bake."]);
  });

  it("returns an empty list when instructions are absent", () => {
    expect(instructionsOf(meal({ strInstructions: null }))).toEqual([]);
  });
});

describe("toSummary", () => {
  it("uses the meal's own category when present", () => {
    expect(toSummary(meal({ strCategory: "Chicken" })).category).toBe("Chicken");
  });

  it("falls back to the filtered category, since filter.php omits it", () => {
    expect(toSummary(meal(), "Seafood").category).toBe("Seafood");
  });

  it("is null when neither is available", () => {
    expect(toSummary(meal()).category).toBeNull();
  });
});

describe("toDetail", () => {
  it("assembles the full record", () => {
    const detail = toDetail(
      meal({
        strCategory: "Chicken",
        strArea: "Japanese",
        strInstructions: "Step one.\nStep two.",
        strIngredient1: "chicken",
        strMeasure1: "2 lb",
        strYoutube: "https://www.youtube.com/watch?v=abc123",
        strSource: "https://example.test/recipe",
      }),
    );

    expect(detail).toMatchObject({
      id: "52772",
      name: "Teriyaki Chicken Casserole",
      category: "Chicken",
      area: "Japanese",
      instructions: ["Step one.", "Step two."],
      ingredients: [{ name: "chicken", measure: "2 lb" }],
      youtubeEmbedUrl: "https://www.youtube.com/embed/abc123",
      sourceUrl: "https://example.test/recipe",
    });
  });

  it("nulls out absent optional fields rather than emitting empty strings", () => {
    const detail = toDetail(meal({ strArea: "", strSource: null }));
    expect(detail.area).toBeNull();
    expect(detail.sourceUrl).toBeNull();
    expect(detail.youtubeEmbedUrl).toBeNull();
  });
});
