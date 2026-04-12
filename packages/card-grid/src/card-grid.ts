export interface CardGridProps {
  columns?: number
}

export function createCardGrid(props: CardGridProps = {}) {
  return {
    dataAttributes: { 'data-slot': 'card-grid' }
  }
}