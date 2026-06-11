export interface PasswordInputProps {
  /** Whether the password is currently revealed (shown as plain text). */
  revealed?: boolean
  /**
   * Accessible label for the reveal (show password) action.
   * @default 'Show password'
   */
  revealLabel?: string
  /**
   * Accessible label for the hide action.
   * @default 'Hide password'
   */
  hideLabel?: string
}

export interface PasswordInputAPI {
  /** The `type` attribute for the underlying input given the revealed state. */
  inputType: 'text' | 'password'
  /** The accessible label for the toggle button given the revealed state. */
  toggleLabel: string
  /** The `aria-pressed` value for the toggle button. */
  togglePressed: boolean
}

export const DEFAULT_REVEAL_LABEL = 'Show password'
export const DEFAULT_HIDE_LABEL = 'Hide password'

/**
 * State-free password-input helper. Given a `revealed` flag (owned by the
 * framework adapter), it returns the input `type`, the toggle button's
 * accessible label, and its `aria-pressed` value. It does not hold state.
 */
export function createPasswordInput(props: PasswordInputProps = {}): PasswordInputAPI {
  const {
    revealed = false,
    revealLabel = DEFAULT_REVEAL_LABEL,
    hideLabel = DEFAULT_HIDE_LABEL,
  } = props

  return {
    inputType: revealed ? 'text' : 'password',
    toggleLabel: revealed ? hideLabel : revealLabel,
    togglePressed: revealed,
  }
}
