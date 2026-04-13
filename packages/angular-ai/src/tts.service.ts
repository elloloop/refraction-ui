import { Injectable, type Provider } from "@angular/core";
import {
  createTTS,
  type TTSConfig,
  type TTSAPI,
  type TTSProvider as TTSProviderInterface,
  type TTSOptions,
} from "@refraction-ui/ai";

/**
 * RefractionTTSService — Angular injectable that wraps the headless TTS manager.
 *
 * Usage:
 * ```ts
 * // In your component/module providers:
 * providers: [provideTTS({ default: 'browser' }, { browser: myBrowserTTS })]
 *
 * // In your component:
 * constructor(private tts: RefractionTTSService) {}
 *
 * read() {
 *   this.tts.speak('Hello world');
 * }
 * ```
 */
@Injectable()
export class RefractionTTSService {
  private api: TTSAPI;
  isSpeaking = false;

  constructor(
    config?: TTSConfig,
    providerMap?: Record<string, TTSProviderInterface>,
  ) {
    this.api = createTTS(config ?? undefined);

    if (providerMap) {
      for (const [name, provider] of Object.entries(providerMap)) {
        this.api.addProvider(name, provider);
      }
    }
  }

  /** List of registered provider names */
  get providers(): string[] {
    return this.api.providers;
  }

  /** Speak text aloud using the resolved TTS provider */
  speak(text: string, opts?: TTSOptions): void {
    this.isSpeaking = true;
    this.api.speak(text, {
      ...opts,
      onEnd: () => {
        this.isSpeaking = false;
        opts?.onEnd?.();
      },
    });
  }

  /** Stop all active TTS playback */
  stop(): void {
    this.api.stop();
    this.isSpeaking = false;
  }

  /** Register a new TTS provider at runtime */
  addProvider(name: string, provider: TTSProviderInterface): void {
    this.api.addProvider(name, provider);
  }
}

/** Provide RefractionTTSService with optional config and pre-registered providers */
export function provideTTS(
  config?: TTSConfig,
  providers?: Record<string, TTSProviderInterface>,
): Provider[] {
  return [
    {
      provide: RefractionTTSService,
      useFactory: () => new RefractionTTSService(config, providers),
    },
  ];
}
