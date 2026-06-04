'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@refraction-ui/react-theme'
import { THEMES, DEFAULT_THEME } from '@refraction-ui/tailwind-config'

interface FlutterPreviewProps {
  path: string
  height?: number
}

const PRESET_STORAGE_KEY = 'rfr-theme-preset'

function getThemeString(mode: 'light' | 'dark' | 'system', resolved: 'light' | 'dark'): string {
  const presetKey = (typeof localStorage !== 'undefined'
    ? localStorage.getItem(PRESET_STORAGE_KEY)
    : null) || DEFAULT_THEME
  
  // Convert preset key 'luxe' -> 'Luxe', 'refraction' -> 'Refraction', etc.
  const presetName = presetKey.charAt(0).toUpperCase() + presetKey.slice(1)
  const modeName = resolved === 'dark' ? 'Dark' : 'Light'
  
  return `${presetName} ${modeName}`
}

export function FlutterPreview({ path, height = 400 }: FlutterPreviewProps) {
  const { mode, resolved } = useTheme()
  const [themeParam, setThemeParam] = useState('Refraction Light')

  useEffect(() => {
    setThemeParam(getThemeString(mode, resolved))
    
    // Listen for storage events in case preset changes in another tab or component
    const handleStorage = () => {
      setThemeParam(getThemeString(mode, resolved))
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('rfr-theme-preset-changed', handleStorage)
    
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('rfr-theme-preset-changed', handleStorage)
    }
  }, [mode, resolved])

  // Map singular React/Next.js docs paths to plural/custom Flutter prototype paths
  const routeMap: Record<string, string> = {
    '/docs/button': '/docs/buttons',
    '/docs/badge': '/docs/badges',
    '/docs/tab': '/docs/tabs',
    '/docs/step': '/docs/steps',
    '/docs/input': '/docs/inputs-&-forms',
    '/docs/form': '/docs/inputs-&-forms',
    '/docs/textarea': '/docs/inputs-&-forms',
    '/docs/checkbox': '/docs/inputs-&-forms',
    '/docs/radio': '/docs/inputs-&-forms',
    '/docs/card': '/docs/cards-&-layouts',
    '/docs/popover': '/docs/popovers-&-tooltips',
    '/docs/tooltip': '/docs/popovers-&-tooltips',
    '/docs/toast': '/docs/toasts',
    '/docs/select': '/docs/select-&-dropdowns',
  }

  const mappedPath = routeMap[path] || path

  // In local development or production, /refraction-ui/flutter/prototype/ will serve the app.
  const src = `/refraction-ui/flutter/prototype/#${mappedPath}`

  return (
    <div 
      className="w-full rounded-xl border border-border bg-card overflow-hidden" 
      style={{ height }}
    >
      <iframe
        key={themeParam}
        src={src}
        className="w-full h-full border-0"
        title={`Flutter Preview for ${path}`}
        allow="clipboard-write"
      />
    </div>
  )
}
