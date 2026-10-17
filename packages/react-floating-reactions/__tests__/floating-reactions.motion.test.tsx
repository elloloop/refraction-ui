import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  floatingReactionItemClass,
  floatingReactionRiseKeyframes,
  floatingReactionFadeKeyframes,
} from '@refraction-ui/floating-reactions'
import { FloatingReactions, ReactionBurst } from '../src/floating-reactions.js'

const count = (html: string, needle: string) => html.split(needle).length - 1
const STYLE_TAG = /<style[^>]*data-href="refraction-ui-floating-reactions"[^>]*>([\s\S]*?)<\/style>/g

describe('FloatingReactions keyframes (SSR)', () => {
  it('ships the rise and reduced-motion fade keyframes with the overlay', () => {
    const html = renderToString(<FloatingReactions reactions={[{ id: '1', emoji: '👋', lane: 1 }]} />)
    const styles = [...html.matchAll(STYLE_TAG)]
    expect(styles).toHaveLength(1)
    expect(styles[0][1]).toContain(`@keyframes ${floatingReactionRiseKeyframes} {`)
    expect(styles[0][1]).toContain(`@keyframes ${floatingReactionFadeKeyframes} {`)
  })

  it('ships them before the first reaction arrives, so it animates from its first frame', () => {
    const html = renderToString(<FloatingReactions reactions={[]} />)
    expect(count(html, `@keyframes ${floatingReactionRiseKeyframes} {`)).toBe(1)
  })

  it('ships them with a standalone ReactionBurst', () => {
    const html = renderToString(<ReactionBurst emoji="🎉" lane={2} />)
    expect(count(html, `@keyframes ${floatingReactionRiseKeyframes} {`)).toBe(1)
    expect(html).toContain('left:50%')
  })

  it('renders the keyframes once per page however many overlays and bursts are mounted', () => {
    const html = renderToString(
      <div>
        <FloatingReactions reactions={[{ id: '1', emoji: '👋' }]} />
        <FloatingReactions reactions={[]} />
        <ReactionBurst emoji="🎉" lane={0} />
        <ReactionBurst emoji="❤️" lane={4} />
      </div>,
    )
    expect([...html.matchAll(STYLE_TAG)]).toHaveLength(1)
    expect(count(html, `@keyframes ${floatingReactionFadeKeyframes} {`)).toBe(1)
  })

  it('puts the keyframes outside the live region, so they are never announced', () => {
    const html = renderToString(<FloatingReactions reactions={[{ id: '1', emoji: '👋' }]} />)
    const overlay = html.slice(html.indexOf('role="status"'))
    expect(overlay).not.toContain('<style')
  })

  it('gives every reaction the rise animation and its reduced-motion fade', () => {
    const html = renderToString(
      <FloatingReactions
        reactions={[
          { id: '1', emoji: '👋', lane: 0 },
          { id: '2', emoji: '❤️', lane: 3 },
        ]}
      />,
    )
    expect(count(html, `class="${floatingReactionItemClass}"`)).toBe(2)
    expect(floatingReactionItemClass).toContain(`animate-[${floatingReactionRiseKeyframes}_`)
    expect(floatingReactionItemClass).toContain(`motion-reduce:animate-[${floatingReactionFadeKeyframes}_`)
  })
})
