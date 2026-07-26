import { describe, it, expect } from 'vitest'
import {
  createSlider,
  clampSliderValue,
  roundToStep,
  getSliderValueFromKey,
} from '../src/index.js'

describe('clampSliderValue', () => {
  it('clamps into [min, max]', () => {
    expect(clampSliderValue(-5, 0, 100)).toBe(0)
    expect(clampSliderValue(105, 0, 100)).toBe(100)
    expect(clampSliderValue(42, 0, 100)).toBe(42)
    expect(clampSliderValue(5, 10, 20)).toBe(10)
  })

  it('returns min for NaN', () => {
    expect(clampSliderValue(Number('nope'), 3, 9)).toBe(3)
  })
})

describe('roundToStep', () => {
  it('rounds to the nearest step offset from min', () => {
    expect(roundToStep(37, 0, 5)).toBe(35)
    expect(roundToStep(38, 0, 5)).toBe(40)
    expect(roundToStep(4, 2, 5)).toBe(2)
    expect(roundToStep(5, 2, 5)).toBe(7)
  })

  it('avoids float noise on decimal steps', () => {
    expect(roundToStep(0.3, 0, 0.1)).toBe(0.3)
    expect(roundToStep(0.55, 0, 0.25)).toBe(0.5)
  })

  it('leaves the value unchanged for a non-positive step', () => {
    expect(roundToStep(3.7, 0, 0)).toBe(3.7)
  })
})

describe('getSliderValueFromKey', () => {
  const opts = { min: 0, max: 100, step: 5 }

  it('increments/decrements by step on arrows', () => {
    expect(getSliderValueFromKey(40, 'ArrowRight', opts)).toBe(45)
    expect(getSliderValueFromKey(40, 'ArrowUp', opts)).toBe(45)
    expect(getSliderValueFromKey(40, 'ArrowLeft', opts)).toBe(35)
    expect(getSliderValueFromKey(40, 'ArrowDown', opts)).toBe(35)
  })

  it('moves by 10×step on PageUp/PageDown', () => {
    expect(getSliderValueFromKey(20, 'PageUp', opts)).toBe(70)
    expect(getSliderValueFromKey(80, 'PageDown', opts)).toBe(30)
  })

  it('jumps to the extremes on Home/End', () => {
    expect(getSliderValueFromKey(40, 'Home', opts)).toBe(0)
    expect(getSliderValueFromKey(40, 'End', opts)).toBe(100)
  })

  it('clamps at the edges', () => {
    expect(getSliderValueFromKey(98, 'ArrowRight', opts)).toBe(100)
    expect(getSliderValueFromKey(2, 'ArrowLeft', opts)).toBe(0)
  })

  it('returns current for unhandled keys', () => {
    expect(getSliderValueFromKey(40, 'Enter', opts)).toBe(40)
  })
})

describe('createSlider', () => {
  it('exposes slider role and value ARIA', () => {
    const api = createSlider({ value: 40, min: 0, max: 100 })
    expect(api.ariaProps.role).toBe('slider')
    expect(api.ariaProps['aria-valuemin']).toBe(0)
    expect(api.ariaProps['aria-valuemax']).toBe(100)
    expect(api.ariaProps['aria-valuenow']).toBe(40)
    expect(api.ariaProps['aria-orientation']).toBe('horizontal')
  })

  it('normalizes the value (clamp + step round)', () => {
    expect(createSlider({ value: 137, max: 100 }).value).toBe(100)
    expect(createSlider({ value: -2 }).value).toBe(0)
    expect(createSlider({ value: 37, step: 5 }).value).toBe(35)
    expect(createSlider({ value: 6, min: 10, max: 20 }).value).toBe(10)
  })

  it('computes the percentage position', () => {
    expect(createSlider({ value: 25, max: 100 }).percentage).toBe(25)
    expect(createSlider({ value: 15, min: 10, max: 20 }).percentage).toBe(50)
    expect(createSlider({ value: 5, min: 5, max: 5 }).percentage).toBe(0)
  })

  it('emits aria-disabled and aria-label only when set', () => {
    const plain = createSlider({ value: 1 })
    expect(plain.ariaProps['aria-disabled']).toBeUndefined()
    expect(plain.ariaProps['aria-label']).toBeUndefined()

    const labeled = createSlider({ value: 1, disabled: true, 'aria-label': 'Volume' })
    expect(labeled.ariaProps['aria-disabled']).toBe(true)
    expect(labeled.ariaProps['aria-label']).toBe('Volume')
  })
})
