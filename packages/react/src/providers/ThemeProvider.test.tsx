import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from '../hooks/useTheme';

// Mock window.matchMedia for jsdom environment
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

const themes = [
  { name: 'default' },
  { name: 'acme' }
];

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider themes={themes}>{children}</ThemeProvider>
  );
}

describe('ThemeProvider', () => {
  it('initializes from localStorage', () => {
    localStorage.setItem('rf-theme', 'acme');
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('acme');
    localStorage.removeItem('rf-theme');
  });

  it('switches theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.switchTheme('acme'));
    expect(result.current.theme).toBe('acme');
  });
});
