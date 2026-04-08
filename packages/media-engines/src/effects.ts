// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Minimal canvas-like context for rendering effects (avoids browser dep) */
export interface CanvasLike {
  fillRect?(x: number, y: number, w: number, h: number): void
  fillText?(text: string, x: number, y: number): void
  [key: string]: unknown
}

export interface EffectControl {
  name: string
  type: 'slider' | 'color' | 'select'
  min?: number
  max?: number
  default: unknown
  value: unknown
}

export interface Effect {
  name: string
  type: string
  render: (ctx: CanvasLike, clip: unknown, time: number) => void
  controls: EffectControl[]
}

export interface EffectConfig {
  name: string
  type: string
  controls: EffectControl[]
  render?: (ctx: CanvasLike, clip: unknown, time: number) => void
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/** Create an Effect from a configuration object. */
export function createEffect(config: EffectConfig): Effect {
  return {
    name: config.name,
    type: config.type,
    controls: config.controls,
    render: config.render ?? (() => {}),
  }
}

// ---------------------------------------------------------------------------
// Built-in effects
// ---------------------------------------------------------------------------

export const BUILT_IN_EFFECTS: Record<string, Effect> = {
  dialogue: createEffect({
    name: 'dialogue',
    type: 'caption',
    controls: [
      { name: 'fontSize', type: 'slider', min: 8, max: 72, default: 24, value: 24 },
      { name: 'fontColor', type: 'color', default: '#ffffff', value: '#ffffff' },
      { name: 'background', type: 'color', default: '#000000', value: '#000000' },
      { name: 'position', type: 'select', default: 'bottom', value: 'bottom' },
    ],
    render(ctx, clip, _time) {
      ctx.fillText?.(`${(clip as { text?: string }).text ?? ''}`, 0, 0)
    },
  }),

  text: createEffect({
    name: 'text',
    type: 'overlay',
    controls: [
      { name: 'fontSize', type: 'slider', min: 8, max: 120, default: 32, value: 32 },
      { name: 'fontColor', type: 'color', default: '#ffffff', value: '#ffffff' },
      { name: 'alignment', type: 'select', default: 'center', value: 'center' },
    ],
    render(ctx, clip, _time) {
      ctx.fillText?.(`${(clip as { text?: string }).text ?? ''}`, 0, 0)
    },
  }),

  picture: createEffect({
    name: 'picture',
    type: 'transform',
    controls: [
      { name: 'scale', type: 'slider', min: 0.1, max: 5, default: 1, value: 1 },
      { name: 'opacity', type: 'slider', min: 0, max: 1, default: 1, value: 1 },
      { name: 'fit', type: 'select', default: 'cover', value: 'cover' },
    ],
    render(ctx, _clip, _time) {
      ctx.fillRect?.(0, 0, 0, 0)
    },
  }),
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Return a copy of the effect with all controls reset to their defaults. */
export function applyEffectDefaults(effect: Effect): Effect {
  return {
    ...effect,
    controls: effect.controls.map((c) => ({ ...c, value: c.default })),
  }
}
