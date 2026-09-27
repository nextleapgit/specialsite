import { describe, it, expect } from 'vitest';
import {
  defaultAppearance,
  normalizeAppearance,
  parseAppearance,
  resolvedTheme,
} from './preferences-model';
describe('personal appearance contract', () => {
  it('starts every persona on the approved blue identity', () => {
    expect(parseAppearance(null)).toEqual({
      guest: defaultAppearance,
      learner: defaultAppearance,
      admin: defaultAppearance,
    });
  });
  it.each([
    null,
    42,
    'bad',
    {},
    { palette: 'invalid', font: 'url(external)', mode: 'invalid', readingSize: Infinity },
  ])('normalizes unknown preference values safely (%j)', (input) =>
    expect(normalizeAppearance(input)).toEqual(defaultAppearance),
  );
  it('recovers from corrupt storage without affecting another data namespace', () =>
    expect(parseAppearance('{')).toEqual(parseAppearance(null)));
  it('keeps the appearance of each demo persona independent', () => {
    const settings = parseAppearance(
      JSON.stringify({
        learner: { palette: 'teal', font: 'tahoma', mode: 'system', readingSize: 'extra' },
      }),
    );
    expect(settings.learner.palette).toBe('teal');
    expect(settings.admin).toEqual(defaultAppearance);
    expect(settings.guest).toEqual(defaultAppearance);
  });
  it('follows device changes only when system mode is selected', () => {
    expect(resolvedTheme('system', true)).toBe('dark');
    expect(resolvedTheme('system', false)).toBe('light');
    expect(resolvedTheme('light', true)).toBe('light');
    expect(resolvedTheme('dark', false)).toBe('dark');
  });
});
