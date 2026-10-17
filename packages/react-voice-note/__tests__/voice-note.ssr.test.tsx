import { describe, expect, it } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { VoiceNote } from '../src/index.js'

const PEAKS = [0.1, 0.4, 0.8, 0.5, 0.2, 0.6]

function render(ui: React.ReactElement): string {
  return renderToString(ui)
}

function sliderTag(html: string): string {
  const match = html.match(/<div[^>]*role="slider"[^>]*>/)
  if (!match) throw new Error('slider not rendered')
  return match[0]
}

describe('VoiceNote (SSR)', () => {
  it('renders a named group in the idle state', () => {
    const html = render(<VoiceNote src="/a.ogg" peaks={PEAKS} duration={45} />)
    expect(html).toContain('role="group"')
    expect(html).toContain('aria-label="Voice note"')
    expect(html).toContain('data-state="idle"')
  })

  it('renders an <audio> that only preloads metadata', () => {
    const html = render(<VoiceNote src="/a.ogg" peaks={PEAKS} />)
    expect(html).toMatch(/<audio[^>]*src="\/a.ogg"/)
    expect(html).toMatch(/<audio[^>]*preload="metadata"/)
    expect(html).not.toMatch(/<audio[^>]*controls/)
  })

  it('renders a Play button named by its action, not a pressed toggle', () => {
    const html = render(<VoiceNote src="/a.ogg" peaks={PEAKS} />)
    const button = html.match(/<button[^>]*data-voice-note-toggle[^>]*>/)?.[0] ?? ''
    expect(button).toContain('aria-label="Play"')
    expect(button).not.toContain('aria-pressed')
  })

  it('exposes slider ARIA with the "0:00 of 0:45" value text', () => {
    const slider = sliderTag(render(<VoiceNote src="/a.ogg" peaks={PEAKS} duration={45} />))
    expect(slider).toContain('aria-label="Seek"')
    expect(slider).toContain('aria-valuemin="0"')
    expect(slider).toContain('aria-valuemax="45"')
    expect(slider).toContain('aria-valuenow="0"')
    expect(slider).toContain('aria-valuetext="0:00 of 0:45"')
    expect(slider).toContain('aria-orientation="horizontal"')
    expect(slider).toContain('tabindex="0"')
    expect(slider).toContain('focus-visible:ring-2')
    expect(slider).toContain('min-h-11')
  })

  it('accepts a custom value text', () => {
    const slider = sliderTag(
      render(
        <VoiceNote
          src="/a.ogg"
          peaks={PEAKS}
          duration={45}
          getAriaValueText={(now, total) => `${now} seconds of ${total}`}
        />,
      ),
    )
    expect(slider).toContain('aria-valuetext="0 seconds of 45"')
  })

  it('shows the elapsed / total clock', () => {
    expect(render(<VoiceNote src="/a.ogg" peaks={PEAKS} duration={45} />)).toContain('0:00 / 0:45')
    expect(render(<VoiceNote src="/a.ogg" peaks={PEAKS} duration={3725} />)).toContain('0:00 / 1:02:05')
  })

  it('renders the waveform twice (unplayed + played layers), hidden from assistive tech', () => {
    const html = render(<VoiceNote src="/a.ogg" peaks={PEAKS} />)
    expect(html.match(/data-waveform-canvas/g)).toHaveLength(2)
    expect(html).toMatch(/<div aria-hidden="true" class="pointer-events-none relative w-full"/)
    expect(html).toContain('text-muted-foreground')
    expect(html).toContain('text-primary')
    expect(html).toContain('clip-path:inset(0 100% 0 0)')
    expect(html).toContain('data-voice-note-playhead')
  })

  it('renders the speed control with a spoken prefix and visible rate', () => {
    const html = render(<VoiceNote src="/a.ogg" peaks={PEAKS} />)
    expect(html).toContain('<span class="sr-only">Playback speed </span>1×')
    const speed = html.match(/<button[^>]*data-voice-note-speed[^>]*>/)?.[0] ?? ''
    expect(speed).toContain('min-h-11 min-w-11')
  })

  it('honours defaultPlaybackRate and a controlled playbackRate', () => {
    expect(render(<VoiceNote src="/a.ogg" peaks={PEAKS} defaultPlaybackRate={1.5} />)).toContain('</span>1.5×')
    expect(render(<VoiceNote src="/a.ogg" peaks={PEAKS} playbackRate={2} />)).toContain('</span>2×')
  })

  it('always renders an empty polite status region for loading / error announcements', () => {
    const html = render(<VoiceNote src="/a.ogg" peaks={PEAKS} />)
    expect(html).toMatch(/<span role="status" class="[^"]*">\s*<\/span>/)
  })

  it('applies label overrides and merges className / extra props', () => {
    const html = render(
      <VoiceNote
        src="/a.ogg"
        peaks={PEAKS}
        className="custom-class"
        id="vn"
        labels={{ group: 'Nachricht', play: 'Abspielen', seek: 'Position', playbackRate: 'Tempo' }}
      />,
    )
    expect(html).toContain('aria-label="Nachricht"')
    expect(html).toContain('aria-label="Abspielen"')
    expect(html).toContain('aria-label="Position"')
    expect(html).toContain('<span class="sr-only">Tempo </span>')
    expect(html).toContain('custom-class')
    expect(html).toContain('id="vn"')
  })

  it('lets an explicit aria-label name the group', () => {
    expect(render(<VoiceNote src="/a.ogg" peaks={PEAKS} aria-label="Voice note from Ana" />)).toContain(
      'aria-label="Voice note from Ana"',
    )
  })
})
