import type { Drink, Ingredient } from "@/types/types";
import React, { createContext, Dispatch, ReactNode, useContext, useReducer } from "react";

type State = {
  drinksById: Record<string, Drink>;
  ingredientsById: Record<string, Ingredient>;
  ingredientNameToId: Record<string, string>;
};

type Action =
  | { type: "UPSERT_DRINKS"; drinks: Drink[] }
  | { type: "UPSERT_INGREDIENT"; ingredient: Ingredient; nameAlias?: string };

const initial: State = { drinksById: {}, ingredientsById: {}, ingredientNameToId: {} };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "UPSERT_DRINKS": {
      const next = { ...state.drinksById };
      for (const d of action.drinks) {
        const prev = next[d.id];
        // full covers partial；partial doesn't cover full
        if (!prev || d.completeness === "full" || prev.completeness !== "full") {
          next[d.id] = { ...(prev ?? {}), ...d };
        }
      }
      return { ...state, drinksById: next };
    }
    case "UPSERT_INGREDIENT": {
      const { ingredient, nameAlias } = action;
      const ingredientsById = { ...state.ingredientsById, [ingredient.id]: ingredient };
      const map = { ...state.ingredientNameToId };
      if (nameAlias) map[nameAlias.toLowerCase()] = ingredient.id;
      return { ...state, ingredientsById, ingredientNameToId: map };
    }
    default:
      return state;
  }
}

const EntityContext = createContext<{ state: State; dispatch: Dispatch<Action> } | null>(null);

export const EntityProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initial);
  return <EntityContext.Provider value={{ state, dispatch }}>{children}</EntityContext.Provider>;
};

export function useEntity() {
  const ctx = useContext(EntityContext);
  if (!ctx) throw new Error("useEntity must be used within EntityProvider");
  return ctx;
}