/** Standard keyboard key constants */
export const Keys = {
  Enter: 'Enter',
  Space: ' ',
  Escape: 'Escape',
  Tab: 'Tab',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
  Backspace: 'Backspace',
  Delete: 'Delete',
} as const

export type KeyboardKey = (typeof Keys)[keyof typeof Keys]

/** Map of key → handler function */
export type KeyboardHandlerMap = Partial<
  Record<string, (event: KeyboardEvent) => void>
>

/** Create a keyboard event handler from a handler map */
export function createKeyboardHandler(
  handlers: KeyboardHandlerMap,
): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    const handler = handlers[event.key]
    if (handler) {
      handler(event)
    }
  }
}
