import { useEntity } from '@/context/EntityContext';
import { useCocktailService } from '@/services/cocktailService';
import type { Drink } from '@/types/types';
import { useEffect, useMemo, useRef, useState } from 'react';

export type Filter = 'all' | 'cocktail' | 'ingredient';

export function useDrinkSearch(initialQuery = '') {
  const { state } = useEntity();
  const svc = useCocktailService();

  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [idsFromCocktail, setIdsFromCocktail] = useState<string[]>([]);
  const [idsFromIngredient, setIdsFromIngredient] = useState<string[]>([]);

  const svcRef = useRef<ReturnType<typeof useCocktailService> | null>(null);
  const requestSeq = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    svcRef.current = svc;
  }, [svc]);

  useEffect(() => {
    const q = query.trim();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (!q) {
      setIdsFromCocktail([]);
      setIdsFromIngredient([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    const currentReq = ++requestSeq.current;

    debounceRef.current = setTimeout(async () => {
      try {
        const svcCurrent = svcRef.current;
        if (!svcCurrent) return;

        const [byCocktailIds, byIngredientIds] = await Promise.all([
          svcCurrent.searchByCocktailName(q).catch(() => []),
          svcCurrent.searchByIngredientName(q).catch(() => []),
        ]);

        if (currentReq !== requestSeq.current) return; 

        const nextCocktail = Array.isArray(byCocktailIds) ? byCocktailIds : [];
        const nextIngredient = Array.isArray(byIngredientIds) ? byIngredientIds : [];

        setIdsFromCocktail((prev) =>
          arraysShallowEqual(prev, nextCocktail) ? prev : nextCocktail
        );
        setIdsFromIngredient((prev) =>
          arraysShallowEqual(prev, nextIngredient) ? prev : nextIngredient
        );

        setLoading(false);
      } catch (e) {
        if (currentReq !== requestSeq.current) return;
        setLoading(false);
        setError(e instanceof Error ? e.message : 'Search failed');
        setIdsFromCocktail([]);
        setIdsFromIngredient([]);
      }
    }, 300); 

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [query]);

  const displayIds = useMemo(() => {
    const filteredIngredientIds = idsFromIngredient.filter((id) => {
      if (idsFromCocktail.includes(id)) return false;
      const drink = state.drinksById[id];
      if (!drink) return true;
      const hasIngredientsData =
        Array.isArray((drink as any).ingredients) &&
        (drink as any).ingredients.length > 0;

      return !hasIngredientsData;
    });

    if (filter === 'cocktail') return idsFromCocktail;
    if (filter === 'ingredient') return filteredIngredientIds;
    return Array.from(new Set([...idsFromCocktail, ...filteredIngredientIds]));
  }, [filter, idsFromCocktail, idsFromIngredient, state.drinksById]);

  const drinks: Drink[] = useMemo(() => {
    return displayIds
      .map((id) => state.drinksById[id])
      .filter((d): d is Drink => Boolean(d));
  }, [displayIds, state.drinksById]);

  return {
    query,
    setQuery,
    filter,
    setFilter,
    drinks,
    loading,
    error,
  };
}

function arraysShallowEqual(a: string[], b: string[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}