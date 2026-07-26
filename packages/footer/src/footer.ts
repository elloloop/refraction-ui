export interface SocialLink {
  label: string
  href: string
  icon?: string
}

export interface FooterColumn {
  title: string
  links: { label: string; href: string }[]
}

export interface FooterProps {
  copyright?: string
  socialLinks?: SocialLink[]
  columns?: FooterColumn[]
  /** Year for the default copyrightText. Default: ambient current year — inject to avoid year-boundary SSR/CSR mismatch. */
  year?: number
}

export interface FooterAPI {
  ariaProps: Record<string, string>
  copyrightText: string
}

export function createFooter(props: FooterProps = {}): FooterAPI {
  const { copyright } = props
  // Injection boundary: ambient year is the default; inject `year` so SSR and client agree.
  const year = props.year ?? new Date().getFullYear()
  const copyrightText = copyright ?? `© ${year} All rights reserved.`

  return {
    ariaProps: { role: 'contentinfo' },
    copyrightText,
  }
}
