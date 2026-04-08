'use client'

import { useTheme } from '@refraction-ui/react-theme'
import { THEMES, DEFAULT_THEME, type ThemeDefinition } from '@refraction-ui/tailwind-config'

const PRESET_STORAGE_KEY = 'rfr-theme-preset'

type Mode = 'light' | 'dark' | 'system'

const modes: { value: Mode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

/**
 * Re-apply the current theme preset's color variables for the given resolved mode.
 * This ensures that when light/dark toggles, the correct color palette from the
 * active theme preset is written to the document root.
 */
function applyPresetColors(resolvedMode: 'light' | 'dark') {
  const presetKey = (typeof localStorage !== 'undefined'
    ? localStorage.getItem(PRESET_STORAGE_KEY)
    : null) || DEFAULT_THEME
  const theme: ThemeDefinition | undefined = THEMES[presetKey]
  if (!theme) return

  const root = document.documentElement
  const colors = resolvedMode === 'dark' ? theme.colors.dark : theme.colors.light
  for (const [key, value] of Object.entries(colors)) {
    root.style.setProperty(key, value)
  }
}

export function ModeToggle() {
  const { mode, setMode, resolved } = useTheme()

  function handleSetMode(newMode: Mode) {
    setMode(newMode)

    // Determine what the resolved mode will be after this change
    let nextResolved: 'light' | 'dark'
    if (newMode === 'system') {
      nextResolved = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    } else {
      nextResolved = newMode
    }

    // Re-apply preset colors for the new resolved mode
    applyPresetColors(nextResolved)
  }

  return (
    <div
      className="inline-flex items-center rounded-full border border-border bg-background/80 backdrop-blur-sm shadow-sm"
      role="radiogroup"
      aria-label="Color mode"
    >
      {modes.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={mode === value}
          aria-label={label}
          title={label}
          onClick={() => handleSetMode(value)}
          className={`inline-flex items-center justify-center px-2 py-1.5 text-sm transition-colors first:rounded-l-full last:rounded-r-full ${
            mode === value
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent/50'
          }`}
        >
          {value === 'light' && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx={12} cy={12} r={5} />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          )}
          {value === 'dark' && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
          {value === 'system' && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x={2} y={3} width={20} height={14} rx={2} ry={2} />
              <line x1={8} y1={21} x2={16} y2={21} />
              <line x1={12} y1={17} x2={12} y2={21} />
            </svg>
          )}
        </button>
      ))}
    </div>
  )
}
