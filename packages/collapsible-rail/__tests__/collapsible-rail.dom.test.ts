// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { isRailChromeClick } from '../src/index.js'

let rail: HTMLElement
let outside: HTMLElement

beforeEach(() => {
  document.body.innerHTML =
    '<aside id="rail"><div id="pad"><span id="text">Section</span>' +
    '<a href="/home"><span id="in-link">Home</span></a>' +
    '<button type="button" id="button">Add</button>' +
    '<div role="option" id="option">Option</div>' +
    '<div aria-disabled="true" id="disabled"><span id="in-disabled">Archived</span></div>' +
    '<label id="label">Show <input id="checkbox" type="checkbox"></label>' +
    '</div></aside>' +
    '<div id="portal"><div id="portal-pad">Menu padding</div></div>'
  rail = document.getElementById('rail')!
  outside = document.getElementById('portal-pad')!
})

afterEach(() => {
  document.body.innerHTML = ''
})

const el = (id: string) => document.getElementById(id)

describe('isRailChromeClick', () => {
  it('is true on the rail itself, its padding and plain text', () => {
    expect(isRailChromeClick(rail, rail)).toBe(true)
    expect(isRailChromeClick(el('pad'), rail)).toBe(true)
    expect(isRailChromeClick(el('text'), rail)).toBe(true)
  })

  it('is false on links, buttons, options, labels and inside them', () => {
    for (const id of ['in-link', 'button', 'option', 'label', 'checkbox']) {
      expect(isRailChromeClick(el(id), rail)).toBe(false)
    }
  })

  it('treats a disabled entry as an item, not chrome', () => {
    expect(isRailChromeClick(el('in-disabled'), rail)).toBe(false)
  })

  it('is false for content outside the rail, such as a portal whose events bubble through it', () => {
    expect(isRailChromeClick(outside, rail)).toBe(false)
    expect(isRailChromeClick(null, rail)).toBe(false)
  })

  it('ignores interactive ancestors outside the rail', () => {
    const wrapper = document.createElement('div')
    wrapper.setAttribute('role', 'button')
    rail.replaceWith(wrapper)
    wrapper.append(rail)
    expect(isRailChromeClick(el('pad'), rail)).toBe(true)
  })
})
