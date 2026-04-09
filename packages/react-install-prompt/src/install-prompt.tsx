import * as React from 'react'
import {
  createInstallPrompt,
  installPromptVariants,
  type InstallPromptProps as CoreInstallPromptProps,
  type StorageAdapter,
} from '@refraction-ui/install-prompt'
import { cn } from '@refraction-ui/shared'

export interface InstallPromptProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Delay in ms before showing. Default: 3000 */
  delay?: number
  /** Storage key for dismissed state. Default: 'rfr-install-dismissed' */
  storageKey?: string
  /** Install button label. Default: 'Install' */
  installLabel?: string
  /** Dismiss button label. Default: 'Dismiss' */
  dismissLabel?: string
  /** Message text. Default: 'Install this app for a better experience' */
  message?: string
}

function createLocalStorage(): StorageAdapter {
  return {
    get(key) {
      try {
        return localStorage.getItem(key)
      } catch {
        return null
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value)
      } catch {
        // Ignore storage errors in SSR or incognito
      }
    },
  }
}

/**
 * InstallPrompt component — renders a bottom banner prompting PWA installation.
 *
 * Uses the headless @refraction-ui/install-prompt core for state and ARIA attributes.
 * Listens for the `beforeinstallprompt` browser event.
 */
export const InstallPrompt = React.forwardRef<HTMLDivElement, InstallPromptProps>(
  (
    {
      delay = 3000,
      storageKey,
      installLabel = 'Install',
      dismissLabel = 'Dismiss',
      message = 'Install this app for a better experience',
      className,
      ...props
    },
    ref,
  ) => {
    const storageRef = React.useRef<StorageAdapter | undefined>(undefined)
    if (typeof window !== 'undefined' && !storageRef.current) {
      storageRef.current = createLocalStorage()
    }

    const api = createInstallPrompt({ delay, storageKey }, storageRef.current)
    const [visible, setVisible] = React.useState(false)
    const promptEventRef = React.useRef<{ prompt(): void } | null>(null)

    React.useEffect(() => {
      if (api.state.isDismissed) return

      const handleBeforeInstall = (e: Event) => {
        e.preventDefault()
        promptEventRef.current = e as unknown as { prompt(): void }
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstall)

      const timer = setTimeout(() => {
        if (promptEventRef.current && !api.state.isDismissed) {
          api.show()
          setVisible(true)
        }
      }, delay)

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
        clearTimeout(timer)
      }
    }, [delay, api])

    if (!visible) return null

    const classes = cn(installPromptVariants(), className)

    return (
      <div ref={ref} className={classes} {...api.ariaProps} {...props}>
        <span>{message}</span>
        <div>
          <button
            type="button"
            onClick={() => {
              api.install(promptEventRef.current ?? undefined)
              setVisible(false)
            }}
          >
            {installLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              api.dismiss()
              setVisible(false)
            }}
          >
            {dismissLabel}
          </button>
        </div>
      </div>
    )
  },
)

InstallPrompt.displayName = 'InstallPrompt'
