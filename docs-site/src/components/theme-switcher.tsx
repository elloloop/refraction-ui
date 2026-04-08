'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  THEMES,
  DEFAULT_THEME,
  type ThemeDefinition,
} from '@refraction-ui/tailwind-config'

const STORAGE_KEY = 'rfr-theme-preset'

function applyTheme(theme: ThemeDefinition) {
  const root = document.documentElement

  // Apply light-mode color variables
  for (const [key, value] of Object.entries(theme.colors.light)) {
    root.style.setProperty(key, value)
  }

  // Apply fonts
  root.style.setProperty('--font-sans', theme.fonts.sans)
  root.style.setProperty('--font-heading', theme.fonts.heading)
  root.style.setProperty('--font-mono', theme.fonts.mono)

  // Apply font sizes
  for (const [key, value] of Object.entries(theme.fontSizes)) {
    root.style.setProperty(`--font-size-${key}`, value)
  }

  // Apply font weights
  for (const [key, value] of Object.entries(theme.fontWeights)) {
    root.style.setProperty(`--font-weight-${key}`, value)
  }

  // Apply radius
  root.style.setProperty('--radius', theme.radius)

  // Apply radius scale
  root.style.setProperty('--radius-none', theme.radiusScale.none)
  root.style.setProperty('--radius-sm', theme.radiusScale.sm)
  root.style.setProperty('--radius-md', theme.radiusScale.md)
  root.style.setProperty('--radius-lg', theme.radiusScale.lg)
  root.style.setProperty('--radius-xl', theme.radiusScale.xl)
  root.style.setProperty('--radius-full', theme.radiusScale.full)

  // Apply shadows
  for (const [key, value] of Object.entries(theme.shadows)) {
    root.style.setProperty(`--shadow-${key}`, value)
  }

  // Apply branding
  root.style.setProperty('--overlay-opacity', theme.overlayOpacity)
  root.style.setProperty('--backdrop-blur', theme.backdropBlur)
  root.style.setProperty('--glass-bg', theme.glassBackground)
  root.style.setProperty('--spacing-scale', String(theme.spacingScale))
  root.style.setProperty('--letter-spacing-tighter', theme.letterSpacing.tighter)
  root.style.setProperty('--letter-spacing-tight', theme.letterSpacing.tight)
  root.style.setProperty('--letter-spacing-normal', theme.letterSpacing.normal)
  root.style.setProperty('--letter-spacing-wide', theme.letterSpacing.wide)
  root.style.setProperty('--letter-spacing-wider', theme.letterSpacing.wider)
  root.style.setProperty('--line-height-tight', theme.lineHeight.tight)
  root.style.setProperty('--line-height-normal', theme.lineHeight.normal)
  root.style.setProperty('--line-height-relaxed', theme.lineHeight.relaxed)
  root.style.setProperty('--heading-weight', theme.headingWeight)
  root.style.setProperty('--border-width', theme.borderWidth)
  root.style.setProperty('--transition-duration', theme.transitionDuration)
  root.style.setProperty('--transition-easing', theme.transitionEasing)
  root.style.setProperty('--container-max-width', theme.containerMaxWidth)
  root.style.setProperty('--container-padding', theme.containerPadding)
}

/** Convert HSL string "h s% l%" to a CSS hsl() color for swatch display */
function hslToCss(hslStr: string): string {
  return `hsl(${hslStr})`
}

export function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState<string>(DEFAULT_THEME)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // On mount, read persisted theme and apply it
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && THEMES[saved]) {
      setActiveTheme(saved)
      applyTheme(THEMES[saved])
    } else {
      applyTheme(THEMES[DEFAULT_THEME])
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelect = useCallback((themeKey: string) => {
    const theme = THEMES[themeKey]
    if (!theme) return
    setActiveTheme(themeKey)
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, themeKey)
    setIsOpen(false)
  }, [])

  const current = THEMES[activeTheme] || THEMES[DEFAULT_THEME]
  const primaryColor = current.colors.light['--primary']

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-border bg-background/80 backdrop-blur-sm px-3 py-1.5 text-sm font-medium text-foreground shadow-sm hover:bg-accent/50 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className="h-3 w-3 rounded-full border border-border/50 shrink-0"
          style={{ backgroundColor: hslToCss(primaryColor) }}
        />
        <span className="hidden sm:inline">{current.displayName}</span>
        <svg
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-background shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          role="listbox"
          aria-label="Select theme"
        >
          <div className="p-1.5">
            {Object.entries(THEMES).map(([key, theme]) => {
              const isActive = key === activeTheme
              const themePrimary = theme.colors.light['--primary']
              const themeAccent = theme.colors.light['--accent']
              const themeBg = theme.colors.light['--background']
              const fontName = theme.fonts.sans.split(',')[0].replace(/'/g, '')

              return (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  role="option"
                  aria-selected={isActive}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50 text-foreground'
                  }`}
                >
                  {/* Color swatch cluster */}
                  <div className="flex -space-x-1 shrink-0">
                    <span
                      className="h-5 w-5 rounded-full border-2 border-background shadow-sm"
                      style={{ backgroundColor: hslToCss(themePrimary) }}
                    />
                    <span
                      className="h-5 w-5 rounded-full border-2 border-background shadow-sm"
                      style={{ backgroundColor: hslToCss(themeAccent) }}
                    />
                    <span
                      className="h-5 w-5 rounded-full border-2 border-background shadow-sm"
                      style={{ backgroundColor: hslToCss(themeBg) }}
                    />
                  </div>

                  {/* Theme name + font info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{theme.displayName}</span>
                      {isActive && (
                        <svg className="h-3.5 w-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{fontName} &middot; {theme.radius} radius</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
