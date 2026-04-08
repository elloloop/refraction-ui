import { describe, it, expect } from 'vitest'
import {
  createEffect,
  BUILT_IN_EFFECTS,
  applyEffectDefaults,
} from '../src/effects.js'
import type { Effect, EffectControl } from '../src/effects.js'

// ---------------------------------------------------------------------------
// EffectControl type shape
// ---------------------------------------------------------------------------
describe('EffectControl type shape', () => {
  it('should accept a slider control', () => {
    const control: EffectControl = {
      name: 'opacity',
      type: 'slider',
      min: 0,
      max: 1,
      default: 1,
      value: 0.5,
    }
    expect(control.type).toBe('slider')
  })

  it('should accept a color control', () => {
    const control: EffectControl = {
      name: 'background',
      type: 'color',
      default: '#ffffff',
      value: '#000000',
    }
    expect(control.type).toBe('color')
  })

  it('should accept a select control', () => {
    const control: EffectControl = {
      name: 'position',
      type: 'select',
      default: 'bottom',
      value: 'top',
    }
    expect(control.type).toBe('select')
  })
})

// ---------------------------------------------------------------------------
// createEffect
// ---------------------------------------------------------------------------
describe('createEffect', () => {
  it('should create an effect with the given config', () => {
    const effect = createEffect({
      name: 'blur',
      type: 'filter',
      controls: [
        { name: 'radius', type: 'slider', min: 0, max: 50, default: 5, value: 5 },
      ],
    })
    expect(effect.name).toBe('blur')
    expect(effect.type).toBe('filter')
    expect(effect.controls.length).toBe(1)
  })

  it('should have a render function', () => {
    const effect = createEffect({
      name: 'test',
      type: 'test',
      controls: [],
    })
    expect(typeof effect.render).toBe('function')
  })

  it('should accept a custom render function', () => {
    let called = false
    const effect = createEffect({
      name: 'custom',
      type: 'custom',
      controls: [],
      render: () => { called = true },
    })
    effect.render({} as any, {} as any, 0)
    expect(called).toBe(true)
  })

  it('should default render to a no-op if not provided', () => {
    const effect = createEffect({
      name: 'noop',
      type: 'noop',
      controls: [],
    })
    expect(() => effect.render({} as any, {} as any, 0)).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// BUILT_IN_EFFECTS
// ---------------------------------------------------------------------------
describe('BUILT_IN_EFFECTS', () => {
  it('should contain a dialogue effect', () => {
    expect(BUILT_IN_EFFECTS.dialogue).toBeDefined()
    expect(BUILT_IN_EFFECTS.dialogue.name).toBe('dialogue')
  })

  it('should contain a text effect', () => {
    expect(BUILT_IN_EFFECTS.text).toBeDefined()
    expect(BUILT_IN_EFFECTS.text.name).toBe('text')
  })

  it('should contain a picture effect', () => {
    expect(BUILT_IN_EFFECTS.picture).toBeDefined()
    expect(BUILT_IN_EFFECTS.picture.name).toBe('picture')
  })

  it('dialogue effect should have controls', () => {
    const d = BUILT_IN_EFFECTS.dialogue
    expect(d.controls.length).toBeGreaterThan(0)
  })

  it('text effect should have controls', () => {
    const t = BUILT_IN_EFFECTS.text
    expect(t.controls.length).toBeGreaterThan(0)
  })

  it('picture effect should have controls', () => {
    const p = BUILT_IN_EFFECTS.picture
    expect(p.controls.length).toBeGreaterThan(0)
  })

  it('all built-in effects should have render functions', () => {
    for (const key of Object.keys(BUILT_IN_EFFECTS)) {
      expect(typeof BUILT_IN_EFFECTS[key].render).toBe('function')
    }
  })
})

// ---------------------------------------------------------------------------
// applyEffectDefaults
// ---------------------------------------------------------------------------
describe('applyEffectDefaults', () => {
  it('should set all control values to their defaults', () => {
    const effect: Effect = {
      name: 'test',
      type: 'test',
      render: () => {},
      controls: [
        { name: 'opacity', type: 'slider', min: 0, max: 1, default: 1, value: 0.3 },
        { name: 'color', type: 'color', default: '#fff', value: '#000' },
      ],
    }
    const reset = applyEffectDefaults(effect)
    expect(reset.controls[0].value).toBe(1)
    expect(reset.controls[1].value).toBe('#fff')
  })

  it('should not mutate the original effect', () => {
    const effect: Effect = {
      name: 'test',
      type: 'test',
      render: () => {},
      controls: [
        { name: 'x', type: 'slider', min: 0, max: 10, default: 5, value: 3 },
      ],
    }
    const reset = applyEffectDefaults(effect)
    expect(effect.controls[0].value).toBe(3)
    expect(reset.controls[0].value).toBe(5)
  })

  it('should preserve other effect properties', () => {
    const effect: Effect = {
      name: 'keep',
      type: 'custom',
      render: () => {},
      controls: [],
    }
    const reset = applyEffectDefaults(effect)
    expect(reset.name).toBe('keep')
    expect(reset.type).toBe('custom')
  })

  it('should handle effect with no controls', () => {
    const effect: Effect = {
      name: 'empty',
      type: 'none',
      render: () => {},
      controls: [],
    }
    const reset = applyEffectDefaults(effect)
    expect(reset.controls).toEqual([])
  })
})
