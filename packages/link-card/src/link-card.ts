export interface LinkCardProps {
  href?: string
}

export function createLinkCard(props: LinkCardProps = {}) {
  return {
    dataAttributes: { 'data-slot': 'link-card' }
  }
}