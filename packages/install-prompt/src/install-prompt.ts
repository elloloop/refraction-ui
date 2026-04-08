export interface StorageAdapter {
  get(key: string): string | null
  set(key: string, value: string): void
}

export interface InstallPromptProps {
  /** Delay in ms before showing prompt. Default: 3000 */
  delay?: number
  /** Key used to persist dismissed state. Default: 'rfr-install-dismissed' */
  storageKey?: string
}

export interface InstallPromptState {
  canShow: boolean
  isDismissed: boolean
}

export interface InstallPromptAPI {
  state: InstallPromptState
  /** Mark the prompt as showable (call after delay + event fire) */
  show(): void
  /** Dismiss and persist */
  dismiss(): void
  /** Trigger the browser install prompt */
  install(promptEvent?: { prompt(): void }): void
  /** ARIA attributes for the banner */
  ariaProps: Record<string, string>
}

export function createInstallPrompt(
  props: InstallPromptProps = {},
  storage?: StorageAdapter,
): InstallPromptAPI {
  const { storageKey = 'rfr-install-dismissed' } = props

  const dismissed = storage?.get(storageKey) === 'true'

  const state: InstallPromptState = {
    canShow: false,
    isDismissed: dismissed,
  }

  return {
    state,

    show() {
      if (!state.isDismissed) {
        state.canShow = true
      }
    },

    dismiss() {
      state.canShow = false
      state.isDismissed = true
      storage?.set(storageKey, 'true')
    },

    install(promptEvent?: { prompt(): void }) {
      promptEvent?.prompt()
      state.canShow = false
    },

    ariaProps: {
      role: 'banner',
      'aria-label': 'Install application',
    },
  }
}
