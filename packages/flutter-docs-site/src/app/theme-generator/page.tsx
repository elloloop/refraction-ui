'use client'

import { useState, useCallback, useMemo } from 'react'
import { CodeBlock } from '@/components/code-block'

// All standard Refraction UI color tokens
const COLOR_TOKENS = [
  'primary', 'primary-foreground',
  'secondary', 'secondary-foreground',
  'destructive', 'destructive-foreground',
  'accent', 'accent-foreground',
  'muted', 'muted-foreground',
  'background', 'foreground',
  'card', 'card-foreground',
  'popover', 'popover-foreground',
  'border', 'input', 'ring'
] as const

type ColorToken = typeof COLOR_TOKENS[number]

export default function ThemeGeneratorPage() {
  const [cssInput, setCssInput] = useState('')
  const [borderRadius, setBorderRadius] = useState('8.0')
  const [fontFamily, setFontFamily] = useState('Inter')
  
  // Default to a basic HSL structure for all colors (using HSL since Refraction UI uses HslColor in Flutter)
  const [colors, setColors] = useState<Record<ColorToken, string>>({
    'primary': '250 50% 50%',
    'primary-foreground': '0 0% 100%',
    'secondary': '240 5% 96%',
    'secondary-foreground': '240 4% 44%',
    'destructive': '0 84% 50%',
    'destructive-foreground': '0 0% 100%',
    'muted': '240 5% 96%',
    'muted-foreground': '240 4% 44%',
    'accent': '250 30% 95%',
    'accent-foreground': '250 50% 40%',
    'background': '0 0% 99%',
    'foreground': '240 10% 10%',
    'card': '0 0% 99%',
    'card-foreground': '240 10% 10%',
    'popover': '0 0% 100%',
    'popover-foreground': '240 10% 10%',
    'border': '240 6% 92%',
    'input': '240 6% 92%',
    'ring': '250 50% 50%',
  })

  // Parse CSS custom properties
  const handleImportCss = useCallback(() => {
    const rootBlockMatch = cssInput.match(/:root\s*{([^}]+)}/)
    const cssBody = rootBlockMatch ? rootBlockMatch[1] : cssInput
    
    const newColors = { ...colors }
    let newRadius = borderRadius
    let newFontFamily = fontFamily

    const regex = /--([\w-]+)\s*:\s*([^;]+)/g
    let match
    while ((match = regex.exec(cssBody)) !== null) {
      const key = match[1].trim()
      const value = match[2].trim()

      if (COLOR_TOKENS.includes(key as ColorToken)) {
        newColors[key as ColorToken] = value
      } else if (key === 'radius') {
        const num = parseFloat(value)
        if (!isNaN(num)) newRadius = num.toString()
      } else if (key === 'font-sans') {
        const font = value.split(',')[0].replace(/['"]/g, '').trim()
        if (font) newFontFamily = font
      }
    }
    
    setColors(newColors)
    setBorderRadius(newRadius)
    setFontFamily(newFontFamily)
  }, [cssInput, colors, borderRadius, fontFamily])

  const dartCode = useMemo(() => {
    const toCamelCase = (str: string) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    
    let colorsCode = ''
    COLOR_TOKENS.forEach(token => {
      const camelKey = toCamelCase(token)
      colorsCode += `    \${camelKey}: HslColor.parse('\${colors[token]}'),\n`
    })

    return `import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

final myCustomTheme = RefractionThemeData(
  borderRadius: \${borderRadius},
  fontFamily: '\${fontFamily}',
  colors: RefractionColors(
\${colorsCode.trimEnd()}
  ),
);`
  }, [colors, borderRadius, fontFamily])

  const handleColorChange = (token: ColorToken, val: string) => {
    setColors(prev => ({ ...prev, [token]: val }))
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Theme Generator</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Create a comprehensive \`RefractionThemeData\` configuration for your Flutter app. 
          The design tokens map 1:1 with React and Astro!
        </p>
      </div>

      {/* CSS Importer Section */}
      <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">1. Import Refraction CSS (Optional)</h2>
        <p className="text-sm text-muted-foreground">
          If you used the LLM Prompt Generator from the React docs, paste the generated CSS here to instantly populate all Flutter theme variables.
        </p>
        <textarea
          value={cssInput}
          onChange={(e) => setCssInput(e.target.value)}
          placeholder=":root {&#10;  --primary: 250 50% 50%;&#10;  --radius: 8px;&#10;  ...&#10;}"
          className="w-full h-32 rounded-lg border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          spellCheck={false}
        />
        <button 
          onClick={handleImportCss}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
        >
          Parse CSS to Dart
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Editor Section */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-6">
            <h2 className="text-xl font-semibold">2. Tweak Visual Variables</h2>
            
            <div className="space-y-4">
              <h3 className="font-medium border-b pb-2">Typography & Shape</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Border Radius</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={borderRadius} 
                    onChange={(e) => setBorderRadius(e.target.value)}
                    className="w-full border rounded-md px-3 py-1.5 text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Font Family</label>
                  <input 
                    type="text" 
                    value={fontFamily} 
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full border rounded-md px-3 py-1.5 text-sm bg-background"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium border-b pb-2">Semantic Colors (HSL Format)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {COLOR_TOKENS.map(token => (
                  <div key={token}>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">{token}</label>
                    <input 
                      type="text" 
                      value={colors[token]} 
                      onChange={(e) => handleColorChange(token, e.target.value)}
                      className="w-full border rounded-md px-3 py-1.5 text-sm bg-background font-mono"
                      placeholder="e.g. 250 50% 50%"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dart Output Section */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden sticky top-8">
            <div className="p-4 border-b bg-muted/50 font-semibold flex justify-between items-center">
              <span>3. Exported Dart Theme</span>
            </div>
            <div className="p-4">
              <CodeBlock language="dart" code={dartCode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
