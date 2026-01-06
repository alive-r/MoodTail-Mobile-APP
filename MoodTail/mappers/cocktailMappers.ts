// mappers/cocktailMappers.ts
import type { Drink, DrinkIngredient, Ingredient } from '@/types/types';

type ApiDrink = {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string | null;
  strAlcoholic?: string | null;
  strInstructions?: string | null;
  [k: `strIngredient${number}`]: string | null | undefined;
  [k: `strMeasure${number}`]: string | null | undefined;
};

export function mapApiDrinkToFull(d: ApiDrink): Drink {
  const ingredients: DrinkIngredient[] = [];
  for (let i = 1; i <= 15; i++) {
    const name = d[`strIngredient${i}`] as string | null | undefined;
    const measure = d[`strMeasure${i}`] as string | null | undefined;
    if (name && name.trim()) {
      ingredients.push({ name: name.trim(), measure: measure?.trim() || undefined });
    }
  }
  const tag = (d.strAlcoholic || 'Unknown') as Drink['alcoholicTag'];
  return {
    id: d.idDrink,
    name: d.strDrink,
    thumb: d.strDrinkThumb || null,
    alcoholicTag:
      tag === 'Alcoholic' || tag === 'Non alcoholic' || tag === 'Optional alcohol'
        ? tag
        : 'Unknown',
    instructions: d.strInstructions ?? null,
    ingredients,
    completeness: 'full',
  };
}

export function mapFilterItemToPartial(item: {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string | null;
}): Drink {
  return {
    id: item.idDrink,
    name: item.strDrink,
    thumb: item.strDrinkThumb ?? null,
    completeness: 'partial',
  } as Drink;
}

export type ApiIngredient = {
  idIngredient: string;
  strIngredient: string;
  strDescription?: string | null;
  strType?: string | null;
  strABV?: string | null;
};

export function mapApiIngredientToModel(api: ApiIngredient): Ingredient {
  return {
    id: api.idIngredient,
    name: api.strIngredient,
    description: api.strDescription ?? null,
    type: api.strType ?? null,
    abv: api.strABV ?? null,
  };
}