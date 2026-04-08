import { describe, it, expect, vi } from 'vitest'
import { createMachine } from '../src/state-machine.js'

describe('createMachine', () => {
  const config = {
    initial: 'idle' as const,
    states: {
      idle: { on: { START: 'running' as const } },
      running: { on: { STOP: 'idle' as const, FINISH: 'done' as const } },
      done: {},
    },
  }

  it('starts in initial state', () => {
    const machine = createMachine(config)
    expect(machine.state).toBe('idle')
  })

  it('transitions on valid events', () => {
    const machine = createMachine(config)
    machine.send('START')
    expect(machine.state).toBe('running')
  })

  it('ignores invalid events', () => {
    const machine = createMachine(config)
    machine.send('STOP') // not valid in 'idle'
    expect(machine.state).toBe('idle')
  })

  it('notifies subscribers on transition', () => {
    const machine = createMachine(config)
    const fn = vi.fn()
    machine.subscribe(fn)
    machine.send('START')
    expect(fn).toHaveBeenCalledWith('running')
  })

  it('unsubscribes correctly', () => {
    const machine = createMachine(config)
    const fn = vi.fn()
    const unsub = machine.subscribe(fn)
    unsub()
    machine.send('START')
    expect(fn).not.toHaveBeenCalled()
  })

  it('matches checks current state', () => {
    const machine = createMachine(config)
    expect(machine.matches('idle')).toBe(true)
    expect(machine.matches('running')).toBe(false)
    machine.send('START')
    expect(machine.matches('running')).toBe(true)
  })

  it('multiple subscribers all get notified', () => {
    const machine = createMachine(config)
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    machine.subscribe(fn1)
    machine.subscribe(fn2)
    machine.send('START')
    expect(fn1).toHaveBeenCalledWith('running')
    expect(fn2).toHaveBeenCalledWith('running')
  })

  it('subscribe after transitions receives future events only', () => {
    const machine = createMachine(config)
    machine.send('START') // transition to running
    const fn = vi.fn()
    machine.subscribe(fn)
    // fn should not have been called for past transition
    expect(fn).not.toHaveBeenCalled()
    machine.send('FINISH') // transition to done
    expect(fn).toHaveBeenCalledWith('done')
  })

  it('no transition for event in terminal state', () => {
    const machine = createMachine(config)
    machine.send('START')
    machine.send('FINISH') // now in 'done' - terminal state
    expect(machine.state).toBe('done')
    const fn = vi.fn()
    machine.subscribe(fn)
    machine.send('START') // no 'on' in done state
    expect(machine.state).toBe('done')
    expect(fn).not.toHaveBeenCalled()
  })
})
