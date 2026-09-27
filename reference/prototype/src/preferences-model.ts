export const paletteIds = ['blue', 'indigo', 'violet', 'teal', 'slate'] as const;
export const fontIds = ['system', 'tahoma', 'arial'] as const;
export type AppearanceSettings = {
  palette: (typeof paletteIds)[number];
  mode: 'light' | 'dark' | 'system';
  font: (typeof fontIds)[number];
  readingSize: 'standard' | 'large' | 'extra';
};
export type Persona = 'guest' | 'learner' | 'admin';
export const APPEARANCE_KEY = 'ar-studio-appearance-v2';
export const defaultAppearance: AppearanceSettings = {
  palette: 'blue',
  mode: 'light',
  font: 'system',
  readingSize: 'standard',
};
export function normalizeAppearance(value: unknown): AppearanceSettings {
  const input = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  return {
    palette: paletteIds.includes(input.palette as AppearanceSettings['palette'])
      ? (input.palette as AppearanceSettings['palette'])
      : 'blue',
    mode: input.mode === 'dark' || input.mode === 'system' ? input.mode : 'light',
    font: fontIds.includes(input.font as AppearanceSettings['font'])
      ? (input.font as AppearanceSettings['font'])
      : 'system',
    readingSize:
      input.readingSize === 'large' || input.readingSize === 'extra'
        ? input.readingSize
        : 'standard',
  };
}
export function parseAppearance(raw: string | null): Record<Persona, AppearanceSettings> {
  let data: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(raw || 'null');
    if (parsed && typeof parsed === 'object') data = parsed;
  } catch {
    /* Invalid preferences fall back without touching learning data. */
  }
  return {
    guest: normalizeAppearance(data.guest),
    learner: normalizeAppearance(data.learner),
    admin: normalizeAppearance(data.admin),
  };
}
export function resolvedTheme(mode: AppearanceSettings['mode'], systemDark: boolean) {
  return mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
}
