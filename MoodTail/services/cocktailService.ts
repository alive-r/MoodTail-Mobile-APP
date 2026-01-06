// services/cocktailService.ts
import {
  getCocktailsByID,
  getIngredientDetail,
  searchCocktail,
  searchCocktailsByIngredient,
} from '@/api/cocktailApi';
import { useEntity } from '@/context/EntityContext';
import { mapApiDrinkToFull, mapApiIngredientToModel, mapFilterItemToPartial } from '@/mappers/cocktailMappers';
import type { Drink, Ingredient } from '@/types/types';

// simple delay helper to respect server rate limits
function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// upsert full data from "search by cocktail name"
function upsertFullDrinks(dispatch: ReturnType<typeof useEntity>['dispatch'], apiDrinks: any[]) {
  const fulls: Drink[] = apiDrinks.map(mapApiDrinkToFull);
  dispatch({ type: 'UPSERT_DRINKS', drinks: fulls });
}

// upsert partial data from "search by ingredient name"
function upsertPartialDrinks(dispatch: ReturnType<typeof useEntity>['dispatch'], items: any[]) {
  const partials: Drink[] = items.map(mapFilterItemToPartial);
  dispatch({ type: 'UPSERT_DRINKS', drinks: partials });
}

// helper: split an array into chunks of size `size`
async function getChunk<T>(arr: T[], size: number): Promise<T[][]> {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// fetch one drink by ID with retry/backoff and 429 handling
async function fetchItemById(id: string, maxRetries = 5) {
  let attempt = 0;
  let delay = 500; // ms, will backoff

  while (true) {
    try {
      const res: any = await getCocktailsByID(id);

      // Some API wrappers may return a Response; others may return parsed JSON/arrays directly.
      if (res && typeof res.ok === 'boolean') {
        // It's a fetch Response
        if (!res.ok) {
          // Respect 429 if present
          if (res.status === 429) {
            const retryAfter = Number(res.headers?.get?.('Retry-After'));
            if (attempt < maxRetries) {
              await sleep((isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : delay) + Math.floor(Math.random() * 250));
              attempt++; delay = Math.min(delay * 2, 8000);
              continue;
            }
          }
          throw new Error(String(res.status));
        }
        const json = await res.json();
        // Support both `json` as array or with `drinks` array
        return Array.isArray(json) ? (json[0] ?? null) : (json?.drinks?.[0] ?? null);
      }

      // Otherwise, assume `getCocktailsByID` already returned data (array or object)
      return Array.isArray(res) ? (res[0] ?? null) : (res?.drinks?.[0] ?? null);
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      const is429 = /429|Too\s*Many\s*Requests/i.test(msg);

      if ((is429 || attempt < maxRetries) && attempt < maxRetries) {
        await sleep(delay + Math.floor(Math.random() * 250));
        attempt++; delay = Math.min(delay * 2, 8000);
        continue;
      }
      // Give up - return a marker so callers can skip it
      return { __error: true, id, error: msg } as any;
    }
  }
}

// helper: fetch with limited concurrency and a delay between batches to avoid 429
async function fetchAll(ids: string[], concurrency = 3, batchDelayMs = 750) {
  const pages = await getChunk(ids, concurrency);
  const results: any[] = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const pageResults = await Promise.all(
      page.map((id) => fetchItemById(id))
    );
    results.push(...pageResults);

    // If there's another page, wait a bit to respect rate limits
    if (i < pages.length - 1) {
      await sleep(batchDelayMs);
    }
  }
  return results;
}

async function ensureDrinksFull(
  dispatch: ReturnType<typeof useEntity>['dispatch'],
  ids: string[],
  hasFull: (id: string) => boolean
) {
  const pending = ids.filter((id) => !hasFull(id));
  if (pending.length === 0) return;
  // Fetch missing drink details with throttling + retries to avoid 429
  const raw = await fetchAll(pending, 3, 750);

  const apiDrinks = raw
    .filter((x: any) => x && !(x.__error)) // drop failed items
    .map((x: any) => x); // items are already the first drink object

  if (apiDrinks.length) upsertFullDrinks(dispatch, apiDrinks);
  return;
}

// used in components
export function useCocktailService() {
  const { state, dispatch } = useEntity(); //trigger: update state

  const hasFull = (id: string) => {
    const d = state.drinksById[id];
    return d?.completeness === 'full';
  };

  return {
    // search by cocktail name, get full data
    searchByCocktailName: async (query: string): Promise<string[]> => {
      const list = await searchCocktail(query);
      upsertFullDrinks(dispatch, list);
      return list.map((d: any) => d.idDrink);
    },

    // search by ingredient name, get partial data （filter.php?i=<name>）
    // then need 'lookup.php?i=' to get cocktail detail by name
    // than change the partial data to full data
    searchByIngredientName: async (ingredientName: string): Promise<string[]> => {
      const items = await searchCocktailsByIngredient(ingredientName);
      upsertPartialDrinks(dispatch, items);

      const ids = items.map((x: any) => x.idDrink);
      // await ensureDrinksFull(dispatch, ids, hasFull);
      return ids;
    },


    //get cocktail detail full by ID, if it's full then skip request/fetch, get data directly
    getDrinkFullById: async (id: string): Promise<void> => {
      await ensureDrinksFull(dispatch, [id], hasFull);
    },

    // for ingredient detail screen
    // get ingredient details
    getIngredientDetailByName: async (name: string): Promise<Ingredient | null> => {
      const d = await getIngredientDetail(name);
      if (!d) return null;
      const ing = mapApiIngredientToModel(d);
      // update global context
      dispatch({ type: 'UPSERT_INGREDIENT', ingredient: ing, nameAlias: name });
      return ing;
    },

    // for ingredient detail screen
    // list cocktails under this ingredient
    listCocktailsByIngredientForDetail: async (ingredientName: string): Promise<string[]> => {
      const items = await searchCocktailsByIngredient(ingredientName);
      upsertPartialDrinks(dispatch, items);

      const ids = items.map((x: any) => x.idDrink);
      await ensureDrinksFull(dispatch, ids, hasFull);
      return ids;
    },
  };
}