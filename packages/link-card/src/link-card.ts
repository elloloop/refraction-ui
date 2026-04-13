export interface LinkCardProps {
  href?: string
}

export function createLinkCard(_props: LinkCardProps = {}) {
  return {
    dataAttributes: { 'data-slot': 'link-card' }
  }
}