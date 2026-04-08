/**
 * Voice registry for TTS providers.
 */

export interface VoiceOption {
  id: string
  name: string
  language: string
  provider: 'browser' | 'google' | 'elevenlabs' | 'openai'
  gender?: 'male' | 'female'
}

export const VOICES: VoiceOption[] = [
  // Browser voices — English
  { id: 'browser-en-us-female', name: 'English (US) Female', language: 'en-US', provider: 'browser', gender: 'female' },
  { id: 'browser-en-us-male', name: 'English (US) Male', language: 'en-US', provider: 'browser', gender: 'male' },
  { id: 'browser-en-gb-female', name: 'English (UK) Female', language: 'en-GB', provider: 'browser', gender: 'female' },
  { id: 'browser-en-gb-male', name: 'English (UK) Male', language: 'en-GB', provider: 'browser', gender: 'male' },
  { id: 'browser-en-in-female', name: 'English (India) Female', language: 'en-IN', provider: 'browser', gender: 'female' },

  // Browser voices — European
  { id: 'browser-fr-female', name: 'French Female', language: 'fr', provider: 'browser', gender: 'female' },
  { id: 'browser-de-female', name: 'German Female', language: 'de', provider: 'browser', gender: 'female' },
  { id: 'browser-es-female', name: 'Spanish Female', language: 'es', provider: 'browser', gender: 'female' },
  { id: 'browser-it-female', name: 'Italian Female', language: 'it', provider: 'browser', gender: 'female' },
  { id: 'browser-pt-female', name: 'Portuguese Female', language: 'pt', provider: 'browser', gender: 'female' },

  // Browser voices — Asian
  { id: 'browser-ja-female', name: 'Japanese Female', language: 'ja', provider: 'browser', gender: 'female' },
  { id: 'browser-ko-female', name: 'Korean Female', language: 'ko', provider: 'browser', gender: 'female' },
  { id: 'browser-zh-female', name: 'Chinese Female', language: 'zh', provider: 'browser', gender: 'female' },
  { id: 'browser-hi-female', name: 'Hindi Female', language: 'hi', provider: 'browser', gender: 'female' },
  { id: 'browser-ar-male', name: 'Arabic Male', language: 'ar', provider: 'browser', gender: 'male' },

  // Google TTS voices
  { id: 'google-en-us-wavenet-d', name: 'Google WaveNet English (US)', language: 'en-US', provider: 'google', gender: 'male' },
  { id: 'google-en-us-wavenet-f', name: 'Google WaveNet English (US) Female', language: 'en-US', provider: 'google', gender: 'female' },
  { id: 'google-en-gb-wavenet-a', name: 'Google WaveNet English (UK)', language: 'en-GB', provider: 'google', gender: 'female' },
  { id: 'google-fr-wavenet-a', name: 'Google WaveNet French', language: 'fr', provider: 'google', gender: 'female' },
  { id: 'google-de-wavenet-a', name: 'Google WaveNet German', language: 'de', provider: 'google', gender: 'female' },
  { id: 'google-es-wavenet-a', name: 'Google WaveNet Spanish', language: 'es', provider: 'google', gender: 'female' },
  { id: 'google-ja-wavenet-a', name: 'Google WaveNet Japanese', language: 'ja', provider: 'google', gender: 'female' },
  { id: 'google-hi-wavenet-a', name: 'Google WaveNet Hindi', language: 'hi', provider: 'google', gender: 'female' },
  { id: 'google-ar-wavenet-a', name: 'Google WaveNet Arabic', language: 'ar', provider: 'google', gender: 'female' },

  // ElevenLabs voices
  { id: 'elevenlabs-rachel', name: 'Rachel', language: 'en', provider: 'elevenlabs', gender: 'female' },
  { id: 'elevenlabs-adam', name: 'Adam', language: 'en', provider: 'elevenlabs', gender: 'male' },
  { id: 'elevenlabs-antoni', name: 'Antoni', language: 'en', provider: 'elevenlabs', gender: 'male' },
  { id: 'elevenlabs-bella', name: 'Bella', language: 'es', provider: 'elevenlabs', gender: 'female' },
  { id: 'elevenlabs-elli', name: 'Elli', language: 'de', provider: 'elevenlabs', gender: 'female' },

  // OpenAI TTS voices
  { id: 'openai-alloy', name: 'Alloy', language: 'en', provider: 'openai' },
  { id: 'openai-echo', name: 'Echo', language: 'en', provider: 'openai', gender: 'male' },
  { id: 'openai-fable', name: 'Fable', language: 'en', provider: 'openai', gender: 'male' },
  { id: 'openai-onyx', name: 'Onyx', language: 'en', provider: 'openai', gender: 'male' },
  { id: 'openai-nova', name: 'Nova', language: 'en', provider: 'openai', gender: 'female' },
  { id: 'openai-shimmer', name: 'Shimmer', language: 'en', provider: 'openai', gender: 'female' },
]

/**
 * Get all voices that match a given language code.
 * Matches both exact codes and prefix codes (e.g., 'en' matches 'en', 'en-US', 'en-GB').
 */
export function getVoicesForLanguage(langCode: string): VoiceOption[] {
  return VOICES.filter((v) => v.language === langCode || v.language.startsWith(langCode + '-') || langCode.startsWith(v.language + '-') || v.language.split('-')[0] === langCode)
}

/**
 * Get the best voice for a language, optionally preferring a specific provider.
 * Returns undefined if no voice matches.
 */
export function getBestVoice(langCode: string, preferredProvider?: VoiceOption['provider']): VoiceOption | undefined {
  const voices = getVoicesForLanguage(langCode)
  if (voices.length === 0) return undefined

  if (preferredProvider) {
    const preferred = voices.find((v) => v.provider === preferredProvider)
    if (preferred) return preferred
  }

  // Return first available voice
  return voices[0]
}

/**
 * Get all voices from a specific provider.
 */
export function getVoicesByProvider(provider: VoiceOption['provider']): VoiceOption[] {
  return VOICES.filter((v) => v.provider === provider)
}
