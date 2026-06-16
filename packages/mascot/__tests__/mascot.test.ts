import { describe, it, expect, vi } from 'vitest'
import { createMascot, getMascotMoodStyles, startMascotBlinkInterval } from '../src/mascot.js'
import { mascotVariants } from '../src/mascot.styles.js'

describe('createMascot', () => {
  it('returns role img and appropriate description', () => {
    const api = createMascot()
    expect(api.ariaProps.role).toBe('img')
    expect(api.ariaProps['aria-label']).toContain('happy')
  })

  it('sets data attributes for slot, mood, size, and animation', () => {
    const api = createMascot({ mood: 'think', size: 'lg', animation: 'float' })
    expect(api.dataAttributes['data-slot']).toBe('mascot')
    expect(api.dataAttributes['data-mood']).toBe('think')
    expect(api.dataAttributes['data-size']).toBe('lg')
    expect(api.dataAttributes['data-animation']).toBe('float')
  })

  it('defaults properly', () => {
    const api = createMascot()
    expect(api.state.mood).toBe('happy')
    expect(api.state.animation).toBe('none')
    expect(api.state.size).toBe('md')
  })
})

describe('mascotVariants', () => {
  it('includes transition class', () => {
    const classes = mascotVariants()
    expect(classes).toContain('transition-all')
  })

  it('reflects size changes', () => {
    expect(mascotVariants({ size: 'sm' })).toContain('w-24')
    expect(mascotVariants({ size: 'xl' })).toContain('w-64')
  })

  it('reflects animation classes', () => {
    expect(mascotVariants({ animation: 'bounce' })).toContain('animate-bounce')
    expect(mascotVariants({ animation: 'float' })).toContain('rfr-mascot-float')
  })
})

describe('getMascotMoodStyles', () => {
  it('maps each mood to specific CSS variables', () => {
    const happyStyles = getMascotMoodStyles('happy')
    expect(happyStyles['--rfr-mascot-shell']).toBe('var(--primary, 138 60% 51%)')
    
    const thinkStyles = getMascotMoodStyles('think')
    expect(thinkStyles['--rfr-mascot-shell']).toBe('250 65% 55%')
    
    const waveStyles = getMascotMoodStyles('wave')
    expect(waveStyles['--rfr-mascot-shell']).toBe('24 85% 50%')
  })
})

describe('startMascotBlinkInterval', () => {
  it('triggers blinking state at intervals', async () => {
    vi.useFakeTimers()
    const onBlink = vi.fn()
    
    const cleanup = startMascotBlinkInterval(onBlink, 1000, 100)
    
    // Fast-forward 1s -> should set blink to true
    await vi.advanceTimersByTimeAsync(1000)
    expect(onBlink).toHaveBeenCalledWith(true)
    
    // Fast-forward 100ms -> should set blink to false
    await vi.advanceTimersByTimeAsync(100)
    expect(onBlink).toHaveBeenLastCalledWith(false)
    
    cleanup()
    vi.useRealTimers()
  })
})


