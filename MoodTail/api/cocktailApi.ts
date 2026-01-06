// api/cocktailApi.ts
const BASE_URL = "https://www.thecocktaildb.com/api/json/v1/1/";

// search cocktails by cocktail name (Full)
export async function searchCocktail(query: string) {
  try {
    const res = await fetch(`${BASE_URL}search.php?s=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.drinks || [];
  } catch (error) {
    console.error("Error fetching cocktails:", error);
    return [];
  }
}

// search cocktails by ingredient name (Partial list)
export async function searchCocktailsByIngredient(ingredient: string) {
  try {
    const res = await fetch(`${BASE_URL}filter.php?i=${encodeURIComponent(ingredient)}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.drinks || [];
  } catch (error) {
    console.error("Error fetching cocktails by ingredient:", error);
    return [];
  }
}

// lookup drink by ID (Full)
export async function getCocktailsByID(drinkId: string) {
  try {
    const res = await fetch(`${BASE_URL}lookup.php?i=${encodeURIComponent(drinkId)}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.drinks || [];
  } catch (error) {
    console.error("Error fetching cocktails by id:", error);
    return [];
  }
}

// ingredient detail by NAME
export async function getIngredientDetail(name: string) {
  try {
    const res = await fetch(`${BASE_URL}search.php?i=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.ingredients?.[0] || null;
  } catch (error) {
    console.error("Error fetching ingredient detail:", error);
    return null;
  }
}

// ingredient detail by ID 
export async function getIngredientById(ingredientId: string) {
  try {
    const res = await fetch(`${BASE_URL}lookup.php?iid=${encodeURIComponent(ingredientId)}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.ingredients?.[0] || null;
  } catch (error) {
    console.error("Error fetching ingredient by id:", error);
    return null;
  }
}