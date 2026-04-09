import * as React from 'react'
import {
  createTTS,
  type TTSConfig,
  type TTSAPI,
  type TTSProvider as TTSProviderInterface,
  type TTSOptions,
} from '@elloloop/ai'

export interface TTSContextValue {
  speak: (text: string, opts?: TTSOptions) => void
  stop: () => void
  isSpeaking: boolean
  providers: string[]
}

const TTSContext = React.createContext<TTSContextValue | null>(null)

export interface TTSProviderProps extends TTSConfig {
  children: React.ReactNode
  /** Pre-register providers by name */
  providers?: Record<string, TTSProviderInterface>
}

/**
 * TTSProvider — wraps your app with TTS context.
 *
 * ```tsx
 * <TTSProvider providers={{ browser: myBrowserTTS }}>
 *   <App />
 * </TTSProvider>
 * ```
 */
export function TTSProvider({ children, providers: providerMap, ...config }: TTSProviderProps) {
  const ttsRef = React.useRef<TTSAPI | null>(null)

  if (!ttsRef.current) {
    ttsRef.current = createTTS(config)
    if (providerMap) {
      for (const [name, provider] of Object.entries(providerMap)) {
        ttsRef.current.addProvider(name, provider)
      }
    }
  }

  const [isSpeaking, setIsSpeaking] = React.useState(false)
  const [providerNames] = React.useState<string[]>(() => ttsRef.current!.providers)

  const value = React.useMemo<TTSContextValue>(
    () => ({
      speak: (text, opts) => {
        setIsSpeaking(true)
        ttsRef.current!.speak(text, {
          ...opts,
          onEnd: () => {
            setIsSpeaking(false)
            opts?.onEnd?.()
          },
        })
      },
      stop: () => {
        ttsRef.current!.stop()
        setIsSpeaking(false)
      },
      isSpeaking,
      providers: providerNames,
    }),
    [isSpeaking, providerNames],
  )

  return React.createElement(TTSContext.Provider, { value }, children)
}

/**
 * useTTS — access TTS methods and state.
 * Must be used within <TTSProvider>.
 */
export function useTTS(): TTSContextValue {
  const ctx = React.useContext(TTSContext)
  if (!ctx) {
    throw new Error('useTTS must be used within a <TTSProvider>')
  }
  return ctx
}
