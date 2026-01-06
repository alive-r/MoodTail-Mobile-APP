import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useDate } from './DateContext';
import { getPhoto, setPhoto as savePhoto, deletePhoto as removePhoto } from '@/storage/photo';
import { useCalendarIndex } from './CalendarIndexContext';
import { useLocation} from './LocationContext';


type PhotoContextProps = {
  photoUri: string | null;
  reload: () => Promise<void>;
  setPhoto: (uri: string) => Promise<void>;
  deletePhoto: () => Promise<void>;
};

const Photo = createContext<PhotoContextProps | undefined>(undefined);

export const PhotoProvider = ({ children }: { children: ReactNode }) => {
  const { selectedDate } = useDate();
  const { bump } = useCalendarIndex();
  const { captureAndSaveMeta, clearMeta } = useLocation();
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const uri = await getPhoto(selectedDate);
    setPhotoUri(uri);
  }, [selectedDate]);

  const setPhoto = useCallback(
    async (uri: string) => {

      await savePhoto(selectedDate, uri);
      await reload();
      try {
        await captureAndSaveMeta();
      } catch (e) {
        console.warn('[PhotoContext] captureAndSaveMeta failed:', e);
      }
      await bump(selectedDate);
    },
    [selectedDate, reload, captureAndSaveMeta, bump]
  );

  const deletePhoto = useCallback(
    async () => {
      await removePhoto(selectedDate);
      await reload();
      try {
        await clearMeta();
      } catch (e) {
        console.warn('[PhotoContext] clearMeta failed:', e);
      }
      await bump(selectedDate);
    },
    [selectedDate, reload, clearMeta, bump]
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <Photo.Provider value={{ photoUri, reload, setPhoto, deletePhoto }}>
      {children}
    </Photo.Provider>
  );
};

export function usePhoto() {
  const ctx = useContext(Photo);
  if (!ctx) throw new Error('usePhoto must be used within PhotoProvider');
  return ctx;
}