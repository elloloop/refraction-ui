import React, { useState, useLayoutEffect, useEffect, useCallback } from 'react';
import { ThemeContext, ThemeContextValue, ThemeProviderProps } from '../types';

export function ThemeProvider({
  children,
  themes,
  defaultTheme = themes[0]?.name ?? 'default',
  defaultMode = 'light',
  storageKey = 'rf-theme',
  modeStorageKey = 'rf-mode',
  system = true,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState(defaultTheme);
  const [mode, setMode] = useState(defaultMode);
  const [isSystem, setIsSystem] = useState(system);

  // Init from storage or system
  useLayoutEffect(() => {
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    const storedMode = typeof window !== 'undefined' ? localStorage.getItem(modeStorageKey) : null;
    if (storedTheme) setTheme(storedTheme);
    if (storedMode) setMode(storedMode);
    else if (system && typeof window !== 'undefined') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      setMode(mql.matches ? 'dark' : 'light');
    }
  }, []);

  // Apply data attributes without flash
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', mode);
  }, [theme, mode]);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, theme);
      localStorage.setItem(modeStorageKey, mode);
    } catch {
      // ignore
    }
  }, [theme, mode]);

  // System mode listener
  useEffect(() => {
    if (!isSystem) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setMode(mql.matches ? 'dark' : 'light');
    mql.addEventListener('change', handler);
    handler();
    return () => mql.removeEventListener('change', handler);
  }, [isSystem]);

  const switchTheme = useCallback((next: string) => {
    setTheme(next);
  }, []);

  const switchMode = useCallback((next: string) => {
    setIsSystem(false);
    setMode(next);
  }, []);

  const toggleTheme = useCallback(() => {
    const index = themes.findIndex((t) => t.name === theme);
    const next = themes[(index + 1) % themes.length]?.name ?? theme;
    setTheme(next);
  }, [theme, themes]);

  const setSystemTheme = useCallback((enabled: boolean) => {
    setIsSystem(enabled);
  }, []);

  const value: ThemeContextValue = {
    theme,
    mode,
    themes,
    switchTheme,
    switchMode,
    toggleTheme,
    isSystem,
    setSystemTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
