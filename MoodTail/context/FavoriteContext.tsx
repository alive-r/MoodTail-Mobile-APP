import { addFavorite, deleteFavorite, getFavorites } from '@/storage/favorite';
import { Favorite } from '@/types/types';
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

interface FavoritesContextProps{
    favorites: Favorite[],
    reloadFavorites: () => Promise<void>;
    addFavoriteItem: (favorite: Favorite) => Promise<void>;
    deleteFavoriteItem: (id: string) => Promise<void>;
    isFaved: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextProps | undefined>(undefined);


export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<Favorite[]>([]);

    const reloadFavorites = useCallback(async () => {
        const data = await getFavorites();
        setFavorites(data);
    },[]);

    const addFavoriteItem = useCallback(async (favorite: Favorite) => {
        await addFavorite(favorite);
        await reloadFavorites();
    }, [reloadFavorites]);

    const deleteFavoriteItem = useCallback(async (id: string) => {
        await deleteFavorite(id);
        await reloadFavorites();
    }, [reloadFavorites]);

    const isFaved = useCallback((idDrink: string) => {
        return favorites.some(d => d.id === idDrink);
      }, [favorites]);
    

    useEffect(() => {
        void reloadFavorites();
    }, [reloadFavorites]);

    return(
        <FavoritesContext.Provider value = {{favorites, reloadFavorites, addFavoriteItem, deleteFavoriteItem, isFaved}}>
            {children}
        </FavoritesContext.Provider>
    )
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};