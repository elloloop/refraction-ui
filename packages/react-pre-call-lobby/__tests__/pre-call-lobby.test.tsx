import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { PreCallLobby } from '../src/pre-call-lobby.js'

const render = (props: Partial<React.ComponentProps<typeof PreCallLobby>>) =>
  renderToString(
    React.createElement(PreCallLobby, {
      cameraOn: true,
      micOn: true,
      ...props,
    }),
  )

describe('PreCallLobby (SSR)', () => {
  it('renders join button with default label', () => {
    const html = render({})
    expect(html).toContain('Join')
    expect(html).toContain('data-testid="join-button"')
  })

  it('renders join button with custom label', () => {
    const html = render({ joinLabel: 'Start meeting' })
    expect(html).toContain('Start meeting')
  })

  it('renders group role and aria-label', () => {
    const html = render({})
    expect(html).toContain('role="group"')
    expect(html).toContain('aria-label="Device setup"')
  })

  it('renders device selects with provided options', () => {
    const cameras = [
      { id: 'cam1', label: 'Built-in Camera' },
      { id: 'cam2', label: 'External Webcam' },
    ]
    const microphones = [{ id: 'mic1', label: 'Built-in Mic' }]
    const html = render({ cameras, microphones })
    expect(html).toContain('data-testid="camera-select"')
    expect(html).toContain('Built-in Camera')
    expect(html).toContain('External Webcam')
    expect(html).toContain('data-testid="microphone-select"')
    expect(html).toContain('Built-in Mic')
  })

  it('does not render device selects when lists are empty', () => {
    const html = render({ cameras: [], microphones: [], speakers: [] })
    expect(html).not.toContain('data-testid="camera-select"')
    expect(html).not.toContain('data-testid="microphone-select"')
  })

  it('renders mic meter bars', () => {
    const html = render({ micLevel: 0.5 })
    // 8 bars total — check for the testid pattern
    expect(html).toContain('data-testid="mic-bar-0"')
    expect(html).toContain('data-testid="mic-bar-7"')
    // 4 lit bars for level 0.5 of 8
    const litBars = (html.match(/data-lit="true"/g) ?? []).length
    expect(litBars).toBe(4)
  })

  it('renders camera-off placeholder when cameraOn=false', () => {
    const html = render({ cameraOn: false })
    expect(html).toContain('data-testid="camera-off-placeholder"')
    expect(html).toContain('Camera is off')
  })

  it('does not render camera-off placeholder when cameraOn=true and previewSlot provided', () => {
    const html = render({
      cameraOn: true,
      previewSlot: React.createElement('video', { 'data-testid': 'preview-video' }),
    })
    expect(html).toContain('data-testid="preview-video"')
    expect(html).not.toContain('Camera is off')
  })

  it('sets data-camera and data-mic attributes', () => {
    const html = render({ cameraOn: false, micOn: true })
    expect(html).toContain('data-camera="off"')
    expect(html).toContain('data-mic="on"')
  })
})
