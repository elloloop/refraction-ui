export interface AnimatedTextProps {
  words: string[]
  interval?: number
  transitionDuration?: number
}

export interface AnimatedTextState {
  currentIndex: number
}

export interface AnimatedTextAPI {
  /** Get the current word */
  getCurrentWord: () => string
  /** Get the next index (wraps around) */
  getNextIndex: () => number
  /** Current state */
  state: AnimatedTextState
}

export interface TypewriterProps {
  text: string
  speed?: number
  startDelay?: number
}

export interface TypewriterState {
  currentIndex: number
}

export interface TypewriterAPI {
  /** Get the currently visible portion of text */
  getVisibleText: () => string
  /** Whether the typewriter has finished */
  isComplete: () => boolean
  /** Current state */
  state: TypewriterState
}

export function createAnimatedText(props: AnimatedTextProps): AnimatedTextAPI {
  const { words, interval: _interval = 2500, transitionDuration: _transitionDuration = 1000 } = props

  const state: AnimatedTextState = {
    currentIndex: 0,
  }

  function getCurrentWord(): string {
    if (words.length === 0) return ''
    return words[state.currentIndex]
  }

  function getNextIndex(): number {
    if (words.length === 0) return 0
    return (state.currentIndex + 1) % words.length
  }

  return {
    getCurrentWord,
    getNextIndex,
    state,
  }
}

export function createTypewriter(props: TypewriterProps): TypewriterAPI {
  const { text, speed: _speed = 50, startDelay: _startDelay = 0 } = props

  const state: TypewriterState = {
    currentIndex: 0,
  }

  function getVisibleText(): string {
    return text.slice(0, state.currentIndex)
  }

  function isComplete(): boolean {
    return state.currentIndex >= text.length
  }

  return {
    getVisibleText,
    isComplete,
    state,
  }
}
