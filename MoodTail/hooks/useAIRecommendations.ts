import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAISuggestions, fetchSwapSimplify, fetchVibeIntro} from '@/api/gptAPI';
import { useCocktailService } from '@/services/cocktailService';
import { useEntity } from '@/context/EntityContext';
import type { Drink } from '@/types/types';

type AIWhyMap = Record<string, string>;

const SLEEP = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useAIRecommender() {
  const { state } = useEntity();
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [whyMap, setWhyMap] = useState<AIWhyMap>({});
  const [coaching, setCoaching] = useState<string | undefined>(undefined);
  const [swaps, setSwaps] = useState<{ have: string; use: string; note?: string }[]>([]);
  const lastWordsRef = useRef<string[]>([]);
  const [intro, setIntro] = useState<string | undefined>(undefined);

  const { searchByCocktailName, getDrinkFullById } = useCocktailService() as {
    searchByCocktailName: (name: string) => Promise<string[]>;
    getDrinkFullById: (id: string) => Promise<void>;
  };

  const waitForDrinks = useCallback(
    async (ids: string[], waitMs = 1500): Promise<void> => {
      const deadline = Date.now() + waitMs;
      while (Date.now() < deadline) {
        const ok = ids.every((id) => !!stateRef.current.drinksById[id]);
        if (ok) return;
        await SLEEP(50);
      }
    },
    []
  );

  const norm = (s: string) =>
    (s || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '') 
      .trim();

  const resolveDrinks = useCallback(
    async (names: string[]): Promise<Drink[]> => {
      const bestIds: string[] = [];
      for (const rawName of names) {
        const ids = await searchByCocktailName(rawName);
        if (!ids?.length) continue;
        await Promise.all(ids.slice(0, 6).map((id) => getDrinkFullById(id).catch(() => undefined)));

        const target = norm(rawName);
        const candidates: Drink[] = ids
          .map((id) => stateRef.current.drinksById[id])
          .filter(Boolean);
        let picked = candidates.find(d => norm(d.name) === target);
        if (!picked) {
          const targetLoose = target.replace(/parenth|dash/g, ''); 
          picked = candidates.find(d => norm(d.name).includes(targetLoose));
        }
        if (!picked) picked = candidates[0];

        if (picked) bestIds.push(picked.id);
      }

      const unique = Array.from(new Set(bestIds));
      await waitForDrinks(unique, 1500);

      return unique
        .map((id) => stateRef.current.drinksById[id])
        .filter(Boolean);
    },
    [getDrinkFullById, searchByCocktailName, waitForDrinks]
  );

  const recommendByWords = useCallback(
    async (words: string[]): Promise<{ drinks: Drink[]; settledWords: string[] }> => {
      setLoading(true);
      setErr(null);
      try {
        const introPromise = fetchVibeIntro(words).catch(() => null);
        const res = await fetchAISuggestions({
          keywords: words,
          excludeNames: [],
          count: 10,
        });
        const names = res.map((r) => r.name).filter(Boolean);
        const drinks = await resolveDrinks(names);

        const byId: AIWhyMap = {};
        for (const d of drinks) {
          const hit = res.find((r) => norm(r.name) === norm(d.name));
          if (hit?.reason) byId[d.id] = hit.reason;
        }
        setWhyMap(byId);
        lastWordsRef.current = words;
        const introText = await introPromise;
        setIntro(introText || undefined);
        return { drinks, settledWords: words };
      } catch (e: any) {
        setErr(String(e?.message || e));
        setIntro(undefined);
        return { drinks: [], settledWords: [] };
      } finally {
        setLoading(false);
      }
    },
    [resolveDrinks]
  );

  const getSwapSimplify = useCallback(
    async (base: string, ingredients: string[]) => {
      setLoading(true);
      setErr(null);
      try {
        const out = await fetchSwapSimplify(base, ingredients); 
        if (!out) throw new Error('No swap result');

        setSwaps(out.swaps ?? []);
        setCoaching(out.oneLineCoaching);
        return out;
      } catch (e: any) {
        setErr(String(e?.message || e));
        setSwaps([]);
        setCoaching(undefined);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // const recommendFromCandidatesAndPantry = useCallback(
  //   async (items: string[], candidateNames: string[], count = 3): Promise<{ drinks: Drink[]; picks: { name: string; why: string; missing?: string[] }[] }> => {
  //     setLoading(true);
  //     setErr(null);
  //     try {
  //       const picks = await rankCocktailsFromPantry(items, candidateNames, count);
  //       const names = picks.map(p => p.name).filter(Boolean);
  //       console.log("this is vibe+pantry",names)
  //       const drinks = await resolveDrinks(names);
  //       const byId: AIWhyMap = {};
  //       for (const d of drinks) {
  //         const hit = picks.find(p => norm(p.name) === norm(d.name));
  //         if (hit?.why) byId[d.id] = hit.why;
  //       }
  //       setWhyMap(prev => ({ ...prev, ...byId }));
  //       setCoaching(undefined);
  //       setSwaps([]);
  //       return { drinks, picks };
  //     } catch (e: any) {
  //       setErr(String(e?.message || e));
  //       return { drinks: [], picks: [] };
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [resolveDrinks]
  // );

  // const recommendFromPantryOnly = useCallback(
  //   async (items: string[], count = 3): Promise<{ drinks: Drink[]; picks: { name: string; why: string; missing?: string[] }[] }> => {
  //     setLoading(true);
  //     setErr(null);
  //     try {
  //       const picks = await topCocktailsFromPantryOnly(items, count);
  //       const names = picks.map(p => p.name).filter(Boolean);
  //       console.log("this is pantry only",names)
  //       const drinks = await resolveDrinks(names);
  //       const byId: AIWhyMap = {};
  //       for (const d of drinks) {
  //         const hit = picks.find(p => norm(p.name) === norm(d.name));
  //         if (hit?.why) byId[d.id] = hit.why;
  //       }
  //       setWhyMap(prev => ({ ...prev, ...byId }));
  //       setCoaching(undefined);
  //       setSwaps([]);
  //       return { drinks, picks };
  //     } catch (e: any) {
  //       setErr(String(e?.message || e));
  //       return { drinks: [], picks: [] };
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [resolveDrinks]
  // );

  return {
    loading,
    error: err,
    whyMap,
    coaching,
    swaps,
    lastWords: lastWordsRef.current,
    intro,
    recommendByWords,
    getSwapSimplify,
    // recommendFromCandidatesAndPantry,
    // recommendFromPantryOnly,
  };
}