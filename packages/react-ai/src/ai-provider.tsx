import * as React from 'react'
import {
  createAI,
  type AIConfig,
  type AIAPI,
  type AIProvider as AIProviderInterface,
  type GenerateOptions,
} from '@refraction-ui/ai'

export interface AIContextValue {
  generateText: (prompt: string, opts?: GenerateOptions) => Promise<string>
  generateJSON: <T = unknown>(prompt: string, opts?: GenerateOptions) => Promise<T>
  providers: string[]
  isGenerating: boolean
}

const AIContext = React.createContext<AIContextValue | null>(null)

export interface AIProviderProps extends AIConfig {
  children: React.ReactNode
  /** Pre-register providers by name */
  providers?: Record<string, AIProviderInterface>
}

/**
 * AIProvider — wraps your app with AI context.
 *
 * ```tsx
 * <AIProvider default="openai" providers={{ openai: myOpenAIProvider }}>
 *   <App />
 * </AIProvider>
 * ```
 */
export function AIProvider({ children, providers: providerMap, ...config }: AIProviderProps) {
  const aiRef = React.useRef<AIAPI | null>(null)

  if (!aiRef.current) {
    aiRef.current = createAI(config)
    if (providerMap) {
      for (const [name, provider] of Object.entries(providerMap)) {
        aiRef.current.addProvider(name, provider)
      }
    }
  }

  const [isGenerating, setIsGenerating] = React.useState(false)
  const [providerNames, setProviderNames] = React.useState<string[]>(() => aiRef.current!.providers)

  const value = React.useMemo<AIContextValue>(
    () => ({
      generateText: async (prompt, opts) => {
        setIsGenerating(true)
        try {
          return await aiRef.current!.generateText(prompt, opts)
        } finally {
          setIsGenerating(false)
        }
      },
      generateJSON: async <T = unknown,>(prompt: string, opts?: GenerateOptions) => {
        setIsGenerating(true)
        try {
          return await aiRef.current!.generateJSON<T>(prompt, opts)
        } finally {
          setIsGenerating(false)
        }
      },
      providers: providerNames,
      isGenerating,
    }),
    [providerNames, isGenerating],
  )

  return React.createElement(AIContext.Provider, { value }, children)
}

/**
 * useAI — access AI generation methods and state.
 * Must be used within <AIProvider>.
 */
export function useAI(): AIContextValue {
  const ctx = React.useContext(AIContext)
  if (!ctx) {
    throw new Error('useAI must be used within an <AIProvider>')
  }
  return ctx
}
