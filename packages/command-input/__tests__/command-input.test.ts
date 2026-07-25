import { describe, it, expect, vi } from 'vitest'
import { CommandInput } from '../src/command-input.js'
import type { CommandInputOptions } from '../src/command-input.js'

const slashTrigger = { char: '/' }

function makeInput(overrides: Partial<CommandInputOptions> = {}) {
  return new CommandInput({ triggers: [slashTrigger], ...overrides })
}

describe('CommandInput trigger detection', () => {
  it('detects a trigger at index 0', () => {
    const onCommandTriggered = vi.fn()
    const input = makeInput({ onCommandTriggered })
    input.handleInput('/help', 5)

    const state = input.getState()
    expect(state.activeTrigger?.char).toBe('/')
    expect(state.activeCommandText).toBe('help')
    expect(onCommandTriggered).toHaveBeenCalledWith(
      expect.objectContaining({ char: '/' }),
      'help',
    )
  })

  it('detects a trigger after a whitespace character', () => {
    const input = makeInput()
    input.handleInput('hello /cmd', 10)

    const state = input.getState()
    expect(state.activeTrigger?.char).toBe('/')
    expect(state.activeCommandText).toBe('cmd')
  })

  it('does not detect a trigger mid-word', () => {
    const input = makeInput()
    input.handleInput('hello/cmd', 9)

    expect(input.getState().activeTrigger).toBeNull()
    expect(input.getState().activeCommandText).toBeNull()
  })

  it('stops the backward scan at whitespace, so a trigger in a previous word is not active', () => {
    const input = makeInput()
    input.handleInput('/cmd extra', 10)

    expect(input.getState().activeTrigger).toBeNull()
    expect(input.getState().activeCommandText).toBeNull()
  })
})

describe('CommandInput node splitting', () => {
  it('splits text around a trigger into text/command/text nodes', () => {
    const input = makeInput()
    input.handleInput('hello /cmd world', 16)

    expect(input.value).toEqual([
      { type: 'text', text: 'hello ' },
      { type: 'command', trigger: '/', text: 'cmd' },
      { type: 'text', text: ' world' },
    ])
  })

  it('emits a command node at index 0 without a leading text node', () => {
    const input = makeInput()
    input.handleInput('/cmd world', 10)

    expect(input.value).toEqual([
      { type: 'command', trigger: '/', text: 'cmd' },
      { type: 'text', text: ' world' },
    ])
  })

  it('returns a single text node when no triggers are configured', () => {
    const input = new CommandInput({ triggers: [] })
    input.handleInput('hello /cmd', 10)

    expect(input.value).toEqual([{ type: 'text', text: 'hello /cmd' }])
  })

  it('escapes regex-special trigger chars when splitting nodes', () => {
    const input = new CommandInput({ triggers: [{ char: '*' }] })
    input.handleInput('say *cmd now', 12)

    expect(input.value).toEqual([
      { type: 'text', text: 'say ' },
      { type: 'command', trigger: '*', text: 'cmd' },
      { type: 'text', text: ' now' },
    ])
  })
})

describe('CommandInput commit/cancel', () => {
  it('Enter commits the active command and clears state', () => {
    const onCommandCommit = vi.fn()
    const input = makeInput({ onCommandCommit })
    input.handleInput('/help', 5)
    input.handleKeyDown('Enter')

    expect(onCommandCommit).toHaveBeenCalledWith(
      expect.objectContaining({ char: '/' }),
      'help',
    )
    expect(input.getState().activeTrigger).toBeNull()
    expect(input.getState().activeCommandText).toBeNull()
  })

  it('Escape cancels the active command and clears state', () => {
    const onCommandCancel = vi.fn()
    const input = makeInput({ onCommandCancel })
    input.handleInput('/help', 5)
    input.handleKeyDown('Escape')

    expect(onCommandCancel).toHaveBeenCalledTimes(1)
    expect(input.getState().activeTrigger).toBeNull()
    expect(input.getState().activeCommandText).toBeNull()
  })
})
