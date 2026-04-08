/**
 * Minimal state machine — zero dependencies, < 1KB.
 * Inspired by XState concepts but dramatically simpler.
 */

export interface MachineConfig<TState extends string, TEvent extends string> {
  initial: TState
  states: Record<TState, {
    on?: Partial<Record<TEvent, TState>>
  }>
}

export interface Machine<TState extends string, TEvent extends string> {
  /** Current state */
  state: TState
  /** Send an event to transition */
  send(event: TEvent): void
  /** Subscribe to state changes. Returns unsubscribe function. */
  subscribe(fn: (state: TState) => void): () => void
  /** Check if machine is in a given state */
  matches(state: TState): boolean
}

export function createMachine<TState extends string, TEvent extends string>(
  config: MachineConfig<TState, TEvent>,
): Machine<TState, TEvent> {
  let current = config.initial
  const listeners = new Set<(state: TState) => void>()

  return {
    get state() {
      return current
    },

    send(event: TEvent) {
      const stateConfig = config.states[current]
      const next = stateConfig?.on?.[event]
      if (next && next !== current) {
        current = next
        for (const fn of listeners) {
          fn(current)
        }
      }
    },

    subscribe(fn: (state: TState) => void) {
      listeners.add(fn)
      return () => {
        listeners.delete(fn)
      }
    },

    matches(state: TState) {
      return current === state
    },
  }
}
