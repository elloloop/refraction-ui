import * as React from 'react'

export interface BrandIconProps extends React.SVGProps<SVGSVGElement> {
  /** Use a monochrome (currentColor) rendering suitable for dark surfaces. */
  mono?: boolean
}

const baseProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true as const,
}

/** Google "G" mark — full brand colors, or a flat currentColor mono variant. */
export function GoogleIcon({ mono, ...props }: BrandIconProps) {
  if (mono) {
    return (
      <svg {...baseProps} {...props}>
        <path
          fill="currentColor"
          d="M21.35 11.1H12v2.92h5.35c-.23 1.4-1.65 4.1-5.35 4.1a5.99 5.99 0 0 1 0-11.98c1.71 0 2.86.73 3.52 1.36l2.4-2.31C16.46 3.7 14.43 2.8 12 2.8a9.2 9.2 0 1 0 0 18.4c5.31 0 8.82-3.73 8.82-8.99 0-.6-.07-1.06-.17-1.51Z"
        />
      </svg>
    )
  }
  return (
    <svg {...baseProps} {...props}>
      <path
        fill="#4285F4"
        d="M21.35 11.1H12v2.92h5.35c-.23 1.4-1.65 4.1-5.35 4.1a5.99 5.99 0 0 1 0-11.98c1.71 0 2.86.73 3.52 1.36l2.4-2.31C16.46 3.7 14.43 2.8 12 2.8a9.2 9.2 0 0 0 0 18.4c5.31 0 8.82-3.73 8.82-8.99 0-.6-.07-1.06-.17-1.51Z"
      />
      <path
        fill="#34A853"
        d="M3.88 7.55l2.41 1.77C6.93 7.76 8.32 6.74 10 6.4l-.34-2.85C7.06 4.02 4.93 5.5 3.88 7.55Z"
        opacity={0}
      />
      <path
        fill="#FBBC05"
        d="M12 21.2c2.43 0 4.46-.8 5.95-2.18l-2.74-2.13c-.74.5-1.74.86-3.21.86-2.66 0-4.92-1.79-5.73-4.2l-2.84 2.18A9.2 9.2 0 0 0 12 21.2Z"
        opacity={0}
      />
    </svg>
  )
}

/** GitHub Octocat mark — monochrome by design. */
export function GitHubIcon({ mono: _mono, ...props }: BrandIconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85l-.01 2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
      />
    </svg>
  )
}

/** Microsoft four-square logo — brand colors, or mono. */
export function MicrosoftIcon({ mono, ...props }: BrandIconProps) {
  if (mono) {
    return (
      <svg {...baseProps} {...props}>
        <path fill="currentColor" d="M3 3h8v8H3z" />
        <path fill="currentColor" d="M13 3h8v8h-8z" opacity={0.7} />
        <path fill="currentColor" d="M3 13h8v8H3z" opacity={0.7} />
        <path fill="currentColor" d="M13 13h8v8h-8z" opacity={0.4} />
      </svg>
    )
  }
  return (
    <svg {...baseProps} {...props}>
      <path fill="#F25022" d="M3 3h8v8H3z" />
      <path fill="#7FBA00" d="M13 3h8v8h-8z" />
      <path fill="#00A4EF" d="M3 13h8v8H3z" />
      <path fill="#FFB900" d="M13 13h8v8h-8z" />
    </svg>
  )
}

/** Apple logo — monochrome by design. */
export function AppleIcon({ mono: _mono, ...props }: BrandIconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path
        fill="currentColor"
        d="M16.37 12.78c-.03-2.62 2.14-3.88 2.24-3.94-1.22-1.79-3.12-2.03-3.79-2.06-1.61-.16-3.15.95-3.97.95-.82 0-2.08-.93-3.42-.9-1.76.03-3.39 1.02-4.29 2.6-1.83 3.18-.47 7.88 1.31 10.46.87 1.26 1.91 2.67 3.27 2.62 1.31-.05 1.81-.85 3.4-.85 1.58 0 2.03.85 3.42.82 1.41-.02 2.31-1.28 3.17-2.55.99-1.46 1.4-2.88 1.42-2.95-.03-.01-2.73-1.05-2.76-4.15M13.9 5.1c.72-.88 1.21-2.09 1.08-3.3-1.04.04-2.3.69-3.04 1.56-.66.77-1.24 2.01-1.09 3.19 1.16.09 2.34-.59 3.05-1.45"
      />
    </svg>
  )
}
