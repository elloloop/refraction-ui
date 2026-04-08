import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetIdCounter } from '@refraction-ui/shared'
import { createTabs } from '../src/tabs.js'
import { tabsListVariants, tabsTriggerVariants } from '../src/tabs.styles.js'

beforeEach(() => {
  resetIdCounter()
})

describe('createTabs', () => {
  it('defaults to empty active value', () => {
    const api = createTabs()
    expect(api.state.activeValue).toBe('')
  })

  it('respects defaultValue', () => {
    const api = createTabs({ defaultValue: 'tab1' })
    expect(api.state.activeValue).toBe('tab1')
  })

  it('respects controlled value prop', () => {
    const api = createTabs({ value: 'tab2' })
    expect(api.state.activeValue).toBe('tab2')
  })

  it('defaults orientation to horizontal', () => {
    const api = createTabs()
    expect(api.listProps['aria-orientation']).toBe('horizontal')
  })

  it('respects vertical orientation', () => {
    const api = createTabs({ orientation: 'vertical' })
    expect(api.listProps['aria-orientation']).toBe('vertical')
  })
})

describe('select', () => {
  it('calls onValueChange when selecting', () => {
    const onValueChange = vi.fn()
    const api = createTabs({ onValueChange })
    api.select('tab1')
    expect(onValueChange).toHaveBeenCalledWith('tab1')
  })

  it('calls onValueChange with different values', () => {
    const onValueChange = vi.fn()
    const api = createTabs({ defaultValue: 'tab1', onValueChange })
    api.select('tab2')
    expect(onValueChange).toHaveBeenCalledWith('tab2')
  })
})

describe('ARIA props', () => {
  it('provides list props with tablist role', () => {
    const api = createTabs()
    expect(api.listProps.role).toBe('tablist')
    expect(api.listProps['aria-orientation']).toBe('horizontal')
  })

  it('provides tab props with tab role', () => {
    const api = createTabs({ defaultValue: 'tab1' })
    const tabProps = api.getTabProps('tab1')
    expect(tabProps.role).toBe('tab')
    expect(tabProps['aria-selected']).toBe(true)
    expect(tabProps.tabIndex).toBe(0)
  })

  it('provides inactive tab props', () => {
    const api = createTabs({ defaultValue: 'tab1' })
    const tabProps = api.getTabProps('tab2')
    expect(tabProps['aria-selected']).toBe(false)
    expect(tabProps.tabIndex).toBe(-1)
  })

  it('provides panel props with tabpanel role', () => {
    const api = createTabs({ defaultValue: 'tab1' })
    const panelProps = api.getPanelProps('tab1')
    expect(panelProps.role).toBe('tabpanel')
    expect(panelProps.hidden).toBeUndefined()
    expect(panelProps.tabIndex).toBe(0)
  })

  it('hides inactive panels', () => {
    const api = createTabs({ defaultValue: 'tab1' })
    const panelProps = api.getPanelProps('tab2')
    expect(panelProps.hidden).toBe(true)
  })

  it('links tab aria-controls to panel id', () => {
    const api = createTabs({ defaultValue: 'tab1' })
    const tabProps = api.getTabProps('tab1')
    const panelProps = api.getPanelProps('tab1')
    expect(tabProps['aria-controls']).toBe(panelProps.id)
  })

  it('links panel aria-labelledby to tab id', () => {
    const api = createTabs({ defaultValue: 'tab1' })
    const tabProps = api.getTabProps('tab1')
    const panelProps = api.getPanelProps('tab1')
    expect(panelProps['aria-labelledby']).toBe(tabProps.id)
  })

  it('tab has data-state attribute', () => {
    const api = createTabs({ defaultValue: 'tab1' })
    expect(api.getTabProps('tab1')['data-state']).toBe('active')
    expect(api.getTabProps('tab2')['data-state']).toBe('inactive')
  })

  it('panel has data-state attribute', () => {
    const api = createTabs({ defaultValue: 'tab1' })
    expect(api.getPanelProps('tab1')['data-state']).toBe('active')
    expect(api.getPanelProps('tab2')['data-state']).toBe('inactive')
  })

  it('generates unique id prefix', () => {
    const api = createTabs()
    expect(api.idPrefix).toMatch(/^rfr-tabs-/)
  })
})

describe('keyboard handlers', () => {
  describe('horizontal orientation', () => {
    it('has ArrowLeft handler', () => {
      const api = createTabs({ orientation: 'horizontal' })
      expect(api.keyboardHandlers['ArrowLeft']).toBeDefined()
    })

    it('has ArrowRight handler', () => {
      const api = createTabs({ orientation: 'horizontal' })
      expect(api.keyboardHandlers['ArrowRight']).toBeDefined()
    })

    it('has Home handler', () => {
      const api = createTabs({ orientation: 'horizontal' })
      expect(api.keyboardHandlers['Home']).toBeDefined()
    })

    it('has End handler', () => {
      const api = createTabs({ orientation: 'horizontal' })
      expect(api.keyboardHandlers['End']).toBeDefined()
    })

    it('does not have ArrowUp/Down handlers', () => {
      const api = createTabs({ orientation: 'horizontal' })
      expect(api.keyboardHandlers['ArrowUp']).toBeUndefined()
      expect(api.keyboardHandlers['ArrowDown']).toBeUndefined()
    })

    it('ArrowRight prevents default', () => {
      const api = createTabs({ orientation: 'horizontal' })
      const event = { key: 'ArrowRight', preventDefault: vi.fn() } as unknown as KeyboardEvent
      api.keyboardHandlers['ArrowRight']!(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })
  })

  describe('vertical orientation', () => {
    it('has ArrowUp handler', () => {
      const api = createTabs({ orientation: 'vertical' })
      expect(api.keyboardHandlers['ArrowUp']).toBeDefined()
    })

    it('has ArrowDown handler', () => {
      const api = createTabs({ orientation: 'vertical' })
      expect(api.keyboardHandlers['ArrowDown']).toBeDefined()
    })

    it('has Home handler', () => {
      const api = createTabs({ orientation: 'vertical' })
      expect(api.keyboardHandlers['Home']).toBeDefined()
    })

    it('has End handler', () => {
      const api = createTabs({ orientation: 'vertical' })
      expect(api.keyboardHandlers['End']).toBeDefined()
    })

    it('does not have ArrowLeft/Right handlers', () => {
      const api = createTabs({ orientation: 'vertical' })
      expect(api.keyboardHandlers['ArrowLeft']).toBeUndefined()
      expect(api.keyboardHandlers['ArrowRight']).toBeUndefined()
    })

    it('ArrowDown prevents default', () => {
      const api = createTabs({ orientation: 'vertical' })
      const event = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent
      api.keyboardHandlers['ArrowDown']!(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })
  })
})

describe('keyboard handler behaviors', () => {
  describe('horizontal navigation', () => {
    it('ArrowLeft handler prevents default (moves to previous tab)', () => {
      const api = createTabs({ orientation: 'horizontal', defaultValue: 'tab2' })
      const event = { key: 'ArrowLeft', preventDefault: vi.fn() } as unknown as KeyboardEvent
      api.keyboardHandlers['ArrowLeft']!(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('ArrowRight handler prevents default (moves to next tab)', () => {
      const api = createTabs({ orientation: 'horizontal', defaultValue: 'tab1' })
      const event = { key: 'ArrowRight', preventDefault: vi.fn() } as unknown as KeyboardEvent
      api.keyboardHandlers['ArrowRight']!(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('Home handler prevents default (selects first tab)', () => {
      const api = createTabs({ orientation: 'horizontal', defaultValue: 'tab3' })
      const event = { key: 'Home', preventDefault: vi.fn() } as unknown as KeyboardEvent
      api.keyboardHandlers['Home']!(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('End handler prevents default (selects last tab)', () => {
      const api = createTabs({ orientation: 'horizontal', defaultValue: 'tab1' })
      const event = { key: 'End', preventDefault: vi.fn() } as unknown as KeyboardEvent
      api.keyboardHandlers['End']!(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('horizontal ignores ArrowUp', () => {
      const api = createTabs({ orientation: 'horizontal' })
      expect(api.keyboardHandlers['ArrowUp']).toBeUndefined()
    })

    it('horizontal ignores ArrowDown', () => {
      const api = createTabs({ orientation: 'horizontal' })
      expect(api.keyboardHandlers['ArrowDown']).toBeUndefined()
    })
  })

  describe('vertical navigation', () => {
    it('ArrowUp handler prevents default (moves to previous tab)', () => {
      const api = createTabs({ orientation: 'vertical', defaultValue: 'tab2' })
      const event = { key: 'ArrowUp', preventDefault: vi.fn() } as unknown as KeyboardEvent
      api.keyboardHandlers['ArrowUp']!(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('ArrowDown handler prevents default (moves to next tab)', () => {
      const api = createTabs({ orientation: 'vertical', defaultValue: 'tab1' })
      const event = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent
      api.keyboardHandlers['ArrowDown']!(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('Home handler prevents default in vertical', () => {
      const api = createTabs({ orientation: 'vertical', defaultValue: 'tab3' })
      const event = { key: 'Home', preventDefault: vi.fn() } as unknown as KeyboardEvent
      api.keyboardHandlers['Home']!(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('End handler prevents default in vertical', () => {
      const api = createTabs({ orientation: 'vertical', defaultValue: 'tab1' })
      const event = { key: 'End', preventDefault: vi.fn() } as unknown as KeyboardEvent
      api.keyboardHandlers['End']!(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('vertical ignores ArrowLeft', () => {
      const api = createTabs({ orientation: 'vertical' })
      expect(api.keyboardHandlers['ArrowLeft']).toBeUndefined()
    })

    it('vertical ignores ArrowRight', () => {
      const api = createTabs({ orientation: 'vertical' })
      expect(api.keyboardHandlers['ArrowRight']).toBeUndefined()
    })
  })
})

describe('panel props extended', () => {
  it('panel hidden attribute is true when inactive', () => {
    const api = createTabs({ defaultValue: 'tab1' })
    const panelProps = api.getPanelProps('tab2')
    expect(panelProps.hidden).toBe(true)
  })

  it('panel hidden attribute is undefined when active', () => {
    const api = createTabs({ defaultValue: 'tab1' })
    const panelProps = api.getPanelProps('tab1')
    expect(panelProps.hidden).toBeUndefined()
  })

  it('panel data-state is active for selected tab', () => {
    const api = createTabs({ defaultValue: 'myTab' })
    expect(api.getPanelProps('myTab')['data-state']).toBe('active')
  })

  it('panel data-state is inactive for non-selected tab', () => {
    const api = createTabs({ defaultValue: 'myTab' })
    expect(api.getPanelProps('otherTab')['data-state']).toBe('inactive')
  })
})

describe('tabs styles', () => {
  it('exports tab list variant styles', () => {
    const classes = tabsListVariants()
    expect(classes).toContain('inline-flex')
    expect(classes).toContain('items-center')
    expect(classes).toContain('rounded-lg')
    expect(classes).toContain('bg-muted')
  })

  it('exports tab trigger variant styles', () => {
    const classes = tabsTriggerVariants()
    expect(classes).toContain('inline-flex')
    expect(classes).toContain('rounded-md')
    expect(classes).toContain('text-sm')
    expect(classes).toContain('font-medium')
  })
})
