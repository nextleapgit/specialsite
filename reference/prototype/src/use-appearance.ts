import { useEffect, useState } from 'react';
import {
  APPEARANCE_KEY,
  defaultAppearance,
  normalizeAppearance,
  parseAppearance,
  resolvedTheme,
  type AppearanceSettings,
  type Persona,
} from './preferences-model';
export function useAppearance(role: Persona) {
  const [profiles, setProfiles] = useState(() => {
    try {
      return parseAppearance(localStorage.getItem(APPEARANCE_KEY));
    } catch {
      return parseAppearance(null);
    }
  });
  const [systemDark, setSystemDark] = useState(
    () => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches,
  );
  const [appearanceStorageError, setStorageError] = useState(false);
  const appearance = profiles[role];
  const theme = resolvedTheme(appearance.mode, systemDark);
  const setAppearance = (patch: Partial<AppearanceSettings>) =>
    setProfiles((current) => ({
      ...current,
      [role]: normalizeAppearance({ ...current[role], ...patch }),
    }));
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const query = matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  useEffect(() => {
    const receive = (event: StorageEvent) => {
      if (event.key === APPEARANCE_KEY) setProfiles(parseAppearance(event.newValue));
    };
    window.addEventListener('storage', receive);
    return () => window.removeEventListener('storage', receive);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(APPEARANCE_KEY, JSON.stringify(profiles));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [profiles]);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.palette = appearance.palette;
    root.dataset.font = appearance.font;
    root.dataset.readingSize = appearance.readingSize;
  }, [appearance, theme]);
  return {
    appearance,
    theme,
    appearanceStorageError,
    setAppearance,
    palette: appearance.palette,
    setPalette: (palette: string) =>
      setAppearance({ palette: normalizeAppearance({ palette }).palette }),
    setTheme: (mode: AppearanceSettings['mode']) => setAppearance({ mode }),
    resetAppearance: () => setAppearance(defaultAppearance),
  };
}
