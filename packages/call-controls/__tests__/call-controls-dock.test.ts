import { describe, it, expect } from 'vitest'
import {
  CALL_CONTROLS_COLLAPSE_WIDTH,
  callControlsDefaultLabels,
  callControlsToggleTone,
  getCallControlsLayout,
  moveCallControlsFocus,
  callControlsCollapseClass,
  callControlsMoreClass,
} from '../src/index.js'

const ids = (layout: ReturnType<typeof getCallControlsLayout>) =>
  layout.groups.map((group) => [group.id, group.items.map((item) => item.id)])

describe('getCallControlsLayout', () => {
  it('renders nothing for controls that are not given', () => {
    const layout = getCallControlsLayout({})
    expect(layout.groups).toEqual([])
    expect(layout.collapsed).toEqual([])
    expect(layout.collapsedHasBadge).toBe(false)
  })

  it('groups the controls in dock order and drops empty groups', () => {
    const layout = getCallControlsLayout({
      people: { active: false },
      record: { active: false },
      mic: { active: true },
      reactions: {},
      camera: { active: true },
      screenShare: { active: false },
      chat: { active: false },
      pip: { active: false },
      hand: { active: false },
      captions: { active: false },
    })
    expect(ids(layout)).toEqual([
      ['media', ['mic', 'camera']],
      ['actions', ['screenShare', 'hand', 'reactions', 'captions', 'pip', 'record']],
      ['panels', ['chat', 'people']],
    ])
    expect(ids(getCallControlsLayout({ mic: { active: true }, chat: { active: false } }))).toEqual([
      ['media', ['mic']],
      ['panels', ['chat']],
    ])
  })

  it('names each group', () => {
    const layout = getCallControlsLayout({ mic: { active: true }, hand: { active: false }, chat: { active: false } })
    expect(layout.groups.map((group) => group.label)).toEqual(['Audio and video', 'Call actions', 'Panels'])
  })

  it('keeps labels stable and carries the state in pressed', () => {
    const on = getCallControlsLayout({ mic: { active: true }, camera: { active: true } })
    const off = getCallControlsLayout({ mic: { active: false }, camera: { active: false } })
    expect(on.groups[0]?.items.map((item) => [item.name, item.pressed])).toEqual([
      ['Microphone', true],
      ['Camera', true],
    ])
    expect(off.groups[0]?.items.map((item) => [item.name, item.pressed])).toEqual([
      ['Microphone', false],
      ['Camera', false],
    ])
  })

  it('treats reactions as a trigger with an optional expanded state', () => {
    const closed = getCallControlsLayout({ reactions: {} }).groups[0]?.items[0]
    expect(closed).toMatchObject({ id: 'reactions', kind: 'trigger', tone: 'default', disabled: false })
    expect(closed).not.toHaveProperty('pressed')
    expect(closed).not.toHaveProperty('expanded')
    const open = getCallControlsLayout({ reactions: { expanded: true } }).groups[0]?.items[0]
    expect(open).toMatchObject({ expanded: true, tone: 'active' })
  })

  it('adds the count to the name and caps the badge', () => {
    const layout = getCallControlsLayout({
      chat: { active: false, count: 3 },
      people: { active: false, count: 140 },
      hand: { active: false, count: 0 },
    })
    const [hand] = layout.groups[0]?.items ?? []
    const [chat, people] = layout.groups[1]?.items ?? []
    expect(chat).toMatchObject({ name: 'Chat (3)', label: 'Chat', badge: '3' })
    expect(people).toMatchObject({ name: 'Participants (140)', badge: '99+' })
    expect(hand).toMatchObject({ name: 'Raise hand' })
    expect(hand).not.toHaveProperty('badge')
  })

  it('ignores counts that are not positive numbers', () => {
    const layout = getCallControlsLayout({
      chat: { active: false, count: Number.NaN },
      people: { active: false, count: -2 },
    })
    expect(layout.groups[0]?.items.every((item) => item.badge === undefined)).toBe(true)
    expect(layout.collapsedHasBadge).toBe(false)
  })

  it('reports a pending control as disabled', () => {
    const layout = getCallControlsLayout({ record: { active: false, pending: true }, reactions: { pending: true } })
    expect(layout.groups[0]?.items.map((item) => item.disabled)).toEqual([true, true])
  })

  it('collapses the actions and panel toggles, never the mic and camera', () => {
    const layout = getCallControlsLayout({
      mic: { active: true },
      camera: { active: false },
      screenShare: { active: true },
      chat: { active: false, count: 2 },
    })
    expect(layout.groups.map((group) => [group.id, group.collapses])).toEqual([
      ['media', false],
      ['actions', true],
      ['panels', true],
    ])
    expect(layout.collapsed.map((item) => item.id)).toEqual(['screenShare', 'chat'])
    expect(layout.collapsedHasBadge).toBe(true)
  })

  it('has nothing to collapse when only the mic and camera are given', () => {
    const layout = getCallControlsLayout({ mic: { active: true }, camera: { active: true } })
    expect(layout.collapsed).toEqual([])
  })

  it('takes label overrides for localisation', () => {
    const layout = getCallControlsLayout(
      { chat: { active: false, count: 4 }, mic: { active: true } },
      { chat: 'Discussion', media: 'Son et vidéo', withCount: (label, count) => `${label}, ${count} non lus` },
    )
    expect(layout.groups[0]?.label).toBe('Son et vidéo')
    expect(layout.groups[1]?.items[0]?.name).toBe('Discussion, 4 non lus')
    expect(layout.groups[0]?.items[0]?.name).toBe(callControlsDefaultLabels.mic)
  })
})

describe('callControlsToggleTone', () => {
  it('is neutral while the mic or camera is on and destructive when it is off', () => {
    expect(callControlsToggleTone('mic', true)).toBe('default')
    expect(callControlsToggleTone('mic', false)).toBe('destructive')
    expect(callControlsToggleTone('camera', true)).toBe('default')
    expect(callControlsToggleTone('camera', false)).toBe('destructive')
  })

  it('warns while recording', () => {
    expect(callControlsToggleTone('record', true)).toBe('destructive')
    expect(callControlsToggleTone('record', false)).toBe('default')
  })

  it('lights other controls up while they are on', () => {
    for (const id of ['screenShare', 'hand', 'captions', 'pip', 'chat', 'people'] as const) {
      expect(callControlsToggleTone(id, true)).toBe('active')
      expect(callControlsToggleTone(id, false)).toBe('default')
    }
  })
})

describe('moveCallControlsFocus', () => {
  it('moves along the row and wraps at the ends', () => {
    expect(moveCallControlsFocus(0, 4, 'ArrowRight')).toBe(1)
    expect(moveCallControlsFocus(3, 4, 'ArrowRight')).toBe(0)
    expect(moveCallControlsFocus(0, 4, 'ArrowLeft')).toBe(3)
    expect(moveCallControlsFocus(2, 4, 'Home')).toBe(0)
    expect(moveCallControlsFocus(1, 4, 'End')).toBe(3)
  })

  it('swaps left and right in a right-to-left layout', () => {
    expect(moveCallControlsFocus(0, 4, 'ArrowLeft', { rtl: true })).toBe(1)
    expect(moveCallControlsFocus(0, 4, 'ArrowRight', { rtl: true })).toBe(3)
  })

  it('moves a column with up and down and ignores the other axis', () => {
    expect(moveCallControlsFocus(0, 3, 'ArrowDown', { axis: 'vertical' })).toBe(1)
    expect(moveCallControlsFocus(0, 3, 'ArrowUp', { axis: 'vertical' })).toBe(2)
    expect(moveCallControlsFocus(0, 3, 'ArrowRight', { axis: 'vertical' })).toBeNull()
    expect(moveCallControlsFocus(0, 3, 'ArrowDown')).toBeNull()
  })

  it('starts from an end when nothing is focused and ignores other keys', () => {
    expect(moveCallControlsFocus(-1, 3, 'ArrowRight')).toBe(0)
    expect(moveCallControlsFocus(-1, 3, 'ArrowLeft')).toBe(2)
    expect(moveCallControlsFocus(1, 3, 'Enter')).toBeNull()
    expect(moveCallControlsFocus(0, 0, 'ArrowRight')).toBeNull()
  })
})

describe('collapse rule', () => {
  it('uses the collapse width in its container queries', () => {
    expect(callControlsCollapseClass).toContain(`@max-[${CALL_CONTROLS_COLLAPSE_WIDTH}px]/call-controls:hidden`)
    expect(callControlsMoreClass).toContain(`@max-[${CALL_CONTROLS_COLLAPSE_WIDTH}px]/call-controls:inline-flex`)
  })
})
