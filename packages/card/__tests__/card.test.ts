import { describe, it, expect } from 'vitest'
import {
  createCard,
  createCardHeader,
  createCardTitle,
  createCardDescription,
  createCardContent,
  createCardFooter,
} from '../src/card.js'
import {
  cardVariants,
  cardHeaderVariants,
  cardTitleVariants,
  cardDescriptionVariants,
  cardContentVariants,
  cardFooterVariants,
} from '../src/card.styles.js'

describe('createCard', () => {
  it('returns data-slot of card', () => {
    const api = createCard()
    expect(api.dataAttributes['data-slot']).toBe('card')
  })

  it('returns empty ariaProps by default', () => {
    const api = createCard()
    expect(api.ariaProps.role).toBeUndefined()
  })

  it('sets role when provided', () => {
    const api = createCard({ role: 'region' })
    expect(api.ariaProps.role).toBe('region')
  })
})

describe('createCardHeader', () => {
  it('returns data-slot of card-header', () => {
    const api = createCardHeader()
    expect(api.dataAttributes['data-slot']).toBe('card-header')
  })
})

describe('createCardTitle', () => {
  it('returns data-slot of card-title', () => {
    const api = createCardTitle()
    expect(api.dataAttributes['data-slot']).toBe('card-title')
  })
})

describe('createCardDescription', () => {
  it('returns data-slot of card-description', () => {
    const api = createCardDescription()
    expect(api.dataAttributes['data-slot']).toBe('card-description')
  })
})

describe('createCardContent', () => {
  it('returns data-slot of card-content', () => {
    const api = createCardContent()
    expect(api.dataAttributes['data-slot']).toBe('card-content')
  })
})

describe('createCardFooter', () => {
  it('returns data-slot of card-footer', () => {
    const api = createCardFooter()
    expect(api.dataAttributes['data-slot']).toBe('card-footer')
  })
})

describe('cardVariants', () => {
  it('returns base card classes', () => {
    const classes = cardVariants()
    expect(classes).toContain('rounded-lg')
    expect(classes).toContain('border')
    expect(classes).toContain('bg-card')
    expect(classes).toContain('text-card-foreground')
    expect(classes).toContain('shadow')
  })

  it('default padding is none (no p-* class added)', () => {
    const classes = cardVariants()
    expect(classes).not.toContain('p-6')
    expect(classes).not.toContain('p-4')
  })

  it('padding default adds p-6', () => {
    const classes = cardVariants({ padding: 'default' })
    expect(classes).toContain('p-6')
  })

  it('padding compact adds p-4', () => {
    const classes = cardVariants({ padding: 'compact' })
    expect(classes).toContain('p-4')
  })

  it('appends custom className', () => {
    const classes = cardVariants({ className: 'my-card' })
    expect(classes).toContain('my-card')
  })
})

describe('cardHeaderVariants', () => {
  it('returns header classes', () => {
    const classes = cardHeaderVariants()
    expect(classes).toContain('flex')
    expect(classes).toContain('flex-col')
    expect(classes).toContain('p-6')
  })
})

describe('cardTitleVariants', () => {
  it('returns default title classes', () => {
    const classes = cardTitleVariants()
    expect(classes).toContain('font-semibold')
    expect(classes).toContain('text-2xl')
  })

  it('sm size returns text-lg', () => {
    const classes = cardTitleVariants({ size: 'sm' })
    expect(classes).toContain('text-lg')
  })

  it('lg size returns text-3xl', () => {
    const classes = cardTitleVariants({ size: 'lg' })
    expect(classes).toContain('text-3xl')
  })
})

describe('cardDescriptionVariants', () => {
  it('returns description classes', () => {
    const classes = cardDescriptionVariants()
    expect(classes).toContain('text-sm')
    expect(classes).toContain('text-muted-foreground')
  })
})

describe('cardContentVariants', () => {
  it('returns content classes', () => {
    const classes = cardContentVariants()
    expect(classes).toContain('p-6')
    expect(classes).toContain('pt-0')
  })
})

describe('cardFooterVariants', () => {
  it('returns footer classes', () => {
    const classes = cardFooterVariants()
    expect(classes).toContain('flex')
    expect(classes).toContain('items-center')
    expect(classes).toContain('p-6')
    expect(classes).toContain('pt-0')
  })
})
