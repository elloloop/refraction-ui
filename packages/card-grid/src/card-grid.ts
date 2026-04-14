export interface CardGridProps {
  columns?: number
}

export function createCardGrid(_props: CardGridProps = {}) {
  return {
    dataAttributes: { 'data-slot': 'card-grid' }
  }
}