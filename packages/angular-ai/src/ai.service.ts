import { Injectable, type Provider } from "@angular/core";
import {
  createAI,
  type AIConfig,
  type AIAPI,
  type AIProvider as AIProviderInterface,
  type GenerateOptions,
} from "@refraction-ui/ai";

/**
 * RefractionAIService — Angular injectable that wraps the headless AI manager.
 *
 * Usage:
 * ```ts
 * // In your component/module providers:
 * providers: [provideAI({ default: 'openai' }, { openai: myOpenAIProvider })]
 *
 * // In your component:
 * constructor(private ai: RefractionAIService) {}
 *
 * async generate() {
 *   const text = await this.ai.generateText('Hello');
 * }
 * ```
 */
@Injectable()
export class RefractionAIService {
  private api: AIAPI;
  isGenerating = false;

  constructor(
    config?: AIConfig,
    providerMap?: Record<string, AIProviderInterface>,
  ) {
    this.api = createAI(config ?? undefined);

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

  /** Generate text from a prompt */
  async generateText(prompt: string, opts?: GenerateOptions): Promise<string> {
    this.isGenerating = true;
    try {
      return await this.api.generateText(prompt, opts);
    } finally {
      this.isGenerating = false;
    }
  }

  /** Generate typed JSON from a prompt */
  async generateJSON<T = unknown>(
    prompt: string,
    opts?: GenerateOptions,
  ): Promise<T> {
    this.isGenerating = true;
    try {
      return await this.api.generateJSON<T>(prompt, opts);
    } finally {
      this.isGenerating = false;
    }
  }

  /** Register a new AI provider at runtime */
  addProvider(name: string, provider: AIProviderInterface): void {
    this.api.addProvider(name, provider);
  }

  /** Remove a registered AI provider */
  removeProvider(name: string): void {
    this.api.removeProvider(name);
  }
}

/** Provide RefractionAIService with optional config and pre-registered providers */
export function provideAI(
  config?: AIConfig,
  providers?: Record<string, AIProviderInterface>,
): Provider[] {
  return [
    {
      provide: RefractionAIService,
      useFactory: () => new RefractionAIService(config, providers),
    },
  ];
}
