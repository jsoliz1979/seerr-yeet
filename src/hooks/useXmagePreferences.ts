import { useCallback, useEffect, useState } from 'react';

export interface XmagePreferences {
  favoriteGenres: number[];
  hiddenGenres: number[];
  animePreference: 'normal' | 'more' | 'hide';
  familyFriendly: boolean;
}

const STORAGE_KEY = 'xmage-user-preferences';

export const defaultXmagePreferences: XmagePreferences = {
  favoriteGenres: [],
  hiddenGenres: [],
  animePreference: 'normal',
  familyFriendly: false,
};

const useXmagePreferences = () => {
  const [preferences, setPreferencesState] = useState<XmagePreferences>(
    defaultXmagePreferences
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferencesState({
          ...defaultXmagePreferences,
          ...(JSON.parse(stored) as Partial<XmagePreferences>),
        });
      }
    } catch {
      // Invalid or unavailable local storage should not break discovery.
    } finally {
      setLoaded(true);
    }
  }, []);

  const setPreferences = useCallback((next: XmagePreferences) => {
    setPreferencesState(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('xmage-preferences-updated'));
  }, []);

  return { preferences, setPreferences, loaded };
};

export default useXmagePreferences;
