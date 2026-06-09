/**
 * @jest-environment jsdom
 */

import {
  applyThemeToDocument,
  parseTheme,
  readStoredTheme,
  writeStoredTheme,
  THEME_STORAGE_KEY,
  DEFAULT_THEME,
} from '../../src/lib/theme';

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
  });

  test('parseTheme: valid values', () => {
    expect(parseTheme('dark')).toBe('dark');
    expect(parseTheme('light')).toBe('light');
  });

  test('parseTheme: invalid falls back to default', () => {
    expect(parseTheme(null)).toBe(DEFAULT_THEME);
    expect(parseTheme('invalid')).toBe(DEFAULT_THEME);
  });

  test('read/write stored theme', () => {
    writeStoredTheme('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(readStoredTheme()).toBe('light');
  });

  test('applyThemeToDocument sets data-theme and dark class for dark', () => {
    applyThemeToDocument('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('applyThemeToDocument sets data-theme and removes dark class for light', () => {
    applyThemeToDocument('dark');
    applyThemeToDocument('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
