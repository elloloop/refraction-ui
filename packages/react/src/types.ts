import React from "react";
export interface ThemeMetadata {
  name: string;
  description?: string;
  author?: string;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  themes: ThemeMetadata[];
  defaultTheme?: string;
  defaultMode?: string;
  storageKey?: string;
  modeStorageKey?: string;
  system?: boolean;
}

export interface ThemeContextValue {
  theme: string;
  mode: string;
  themes: ThemeMetadata[];
  switchTheme: (theme: string) => void;
  switchMode: (mode: string) => void;
  toggleTheme: () => void;
  isSystem: boolean;
  setSystemTheme: (enabled: boolean) => void;
}

export const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);
