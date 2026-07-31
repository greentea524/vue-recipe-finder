import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MealDbError,
  listCategories,
  mealById,
  mealsByCategory,
  randomMeal,
  searchMeals,
} from "./mealdb";

function mockFetch(impl: (url: string) => Promise<Response> | Response) {
  const spy = vi.fn((input: RequestInfo | URL) => impl(String(input)));
  vi.stubGlobal("fetch", spy);
  return spy;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

afterEach(() => vi.unstubAllGlobals());

describe("searchMeals", () => {
  it("maps results to summaries", async () => {
    mockFetch(() =>
      json({
        meals: [
          {
            idMeal: "1",
            strMeal: "Arrabiata",
            strMealThumb: "t.jpg",
            strCategory: "Vegetarian",
          },
        ],
      }),
    );

    await expect(searchMeals("arra")).resolves.toEqual([
      { id: "1", name: "Arrabiata", thumb: "t.jpg", category: "Vegetarian" },
    ]);
  });

  it("treats the API's null meals as no results, not an error", async () => {
    mockFetch(() => json({ meals: null }));
    await expect(searchMeals("zzzzz")).resolves.toEqual([]);
  });

  it("url-encodes the query", async () => {
    const spy = mockFetch(() => json({ meals: null }));
    await searchMeals("chicken & rice");
    expect(String(spy.mock.calls[0][0])).toContain("s=chicken%20%26%20rice");
  });
});

describe("mealsByCategory", () => {
  it("stamps the filtered category onto results, which filter.php omits", async () => {
    mockFetch(() =>
      json({ meals: [{ idMeal: "2", strMeal: "Fish", strMealThumb: "f.jpg" }] }),
    );

    await expect(mealsByCategory("Seafood")).resolves.toEqual([
      { id: "2", name: "Fish", thumb: "f.jpg", category: "Seafood" },
    ]);
  });
});

describe("listCategories", () => {
  it("maps categories", async () => {
    mockFetch(() =>
      json({ categories: [{ idCategory: "1", strCategory: "Beef" }] }),
    );
    await expect(listCategories()).resolves.toEqual([
      { id: "1", name: "Beef" },
    ]);
  });

  it("survives a null categories payload", async () => {
    mockFetch(() => json({ categories: null }));
    await expect(listCategories()).resolves.toEqual([]);
  });
});

describe("mealById", () => {
  it("returns null for an unknown id rather than throwing", async () => {
    mockFetch(() => json({ meals: null }));
    await expect(mealById("nope")).resolves.toBeNull();
  });

  it("returns a detail for a known id", async () => {
    mockFetch(() =>
      json({
        meals: [
          {
            idMeal: "52772",
            strMeal: "Teriyaki",
            strMealThumb: "t.jpg",
            strIngredient1: "soy",
            strMeasure1: "1 cup",
          },
        ],
      }),
    );
    const detail = await mealById("52772");
    expect(detail?.ingredients).toEqual([{ name: "soy", measure: "1 cup" }]);
  });
});

describe("randomMeal", () => {
  it("errors when the service returns no meal", async () => {
    mockFetch(() => json({ meals: null }));
    await expect(randomMeal()).rejects.toBeInstanceOf(MealDbError);
  });
});

describe("failure handling", () => {
  it("wraps a network failure in a friendly MealDbError", async () => {
    mockFetch(() => Promise.reject(new TypeError("Failed to fetch")));
    await expect(searchMeals("x")).rejects.toBeInstanceOf(MealDbError);
  });

  it("reports a non-OK status", async () => {
    mockFetch(() => json({}, 503));
    await expect(searchMeals("x")).rejects.toThrow(/503/);
  });

  it("reports unreadable JSON", async () => {
    mockFetch(() => new Response("<html>nope</html>", { status: 200 }));
    await expect(searchMeals("x")).rejects.toThrow(/unreadable/);
  });

  it("lets an abort propagate so a superseded search isn't shown as an error", async () => {
    mockFetch(() =>
      Promise.reject(new DOMException("Aborted", "AbortError")),
    );
    await expect(searchMeals("x")).rejects.toBeInstanceOf(DOMException);
  });
});
