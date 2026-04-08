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
}

export interface FooterAPI {
  ariaProps: Record<string, string>
  copyrightText: string
}

export function createFooter(props: FooterProps = {}): FooterAPI {
  const { copyright } = props
  const year = new Date().getFullYear()
  const copyrightText = copyright ?? `© ${year} All rights reserved.`

  return {
    ariaProps: { role: 'contentinfo' },
    copyrightText,
  }
}
