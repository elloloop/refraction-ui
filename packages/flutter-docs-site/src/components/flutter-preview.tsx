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
    // Custom event we might dispatch from mode-toggle or theme-config-panel
    window.addEventListener('rfr-theme-preset-changed', handleStorage)
    
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('rfr-theme-preset-changed', handleStorage)
    }
  }, [mode, resolved])

  // In local development or production, /flutter/ will serve the Widgetbook Web build.
  // We append &preview=true to hide the Widgetbook sidebar and only show the component.
  // Note: Widgetbook uses URL parameters to set the state of Addons like ThemeAddon.
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const themeGroup = `{name:${encodeURIComponent(themeParam)}}`
  const src = `${basePath}/flutter/index.html#/?path=${path}&theme=${encodeURIComponent(themeGroup)}&preview=true`

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
