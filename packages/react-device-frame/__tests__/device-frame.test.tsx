import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetIdCounter } from '@refraction-ui/shared'
import { DeviceFrame } from '../src/device-frame.js'

beforeEach(() => {
  resetIdCounter()
})

describe('DeviceFrame (React SSR)', () => {
  it('renders with img role', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'iphone' }),
    )
    expect(html).toContain('role="img"')
  })

  it('renders with aria-label', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'iphone' }),
    )
    expect(html).toContain('aria-label="iPhone device frame in portrait orientation"')
  })

  it('renders with data-device attribute', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'iphone' }),
    )
    expect(html).toContain('data-device="iphone"')
  })

  it('renders with data-orientation attribute', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'iphone', orientation: 'landscape' }),
    )
    expect(html).toContain('data-orientation="landscape"')
  })

  it('renders with correct dimensions in style', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'iphone' }),
    )
    expect(html).toContain('width:375px')
    expect(html).toContain('height:812px')
  })

  it('renders landscape dimensions', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'iphone', orientation: 'landscape' }),
    )
    expect(html).toContain('width:812px')
    expect(html).toContain('height:375px')
  })

  it('renders notch for iphone', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'iphone' }),
    )
    expect(html).toContain('data-part="notch"')
    expect(html).toContain('aria-hidden="true"')
  })

  it('does not render notch for android-phone', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'android-phone' }),
    )
    expect(html).not.toContain('data-part="notch"')
  })

  it('renders home indicator for iphone', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'iphone' }),
    )
    expect(html).toContain('data-part="home-indicator"')
  })

  it('renders home indicator for ipad', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'ipad' }),
    )
    expect(html).toContain('data-part="home-indicator"')
  })

  it('does not render home indicator for android-phone', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'android-phone' }),
    )
    expect(html).not.toContain('data-part="home-indicator"')
  })

  it('does not render home indicator for android-tablet', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'android-tablet' }),
    )
    expect(html).not.toContain('data-part="home-indicator"')
  })

  it('renders screen area', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'iphone' }),
    )
    expect(html).toContain('data-part="screen"')
  })

  it('renders children in screen area', () => {
    const html = renderToString(
      React.createElement(
        DeviceFrame,
        { device: 'iphone' },
        React.createElement('div', null, 'App Content'),
      ),
    )
    expect(html).toContain('App Content')
    expect(html).toContain('data-part="screen"')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, {
        device: 'iphone',
        className: 'my-frame',
      }),
    )
    expect(html).toContain('my-frame')
  })

  it('applies device variant styles for iphone', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'iphone' }),
    )
    expect(html).toContain('overflow-hidden')
  })

  it('renders ipad with correct dimensions', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'ipad' }),
    )
    expect(html).toContain('width:810px')
    expect(html).toContain('height:1080px')
  })

  it('renders android-phone with correct dimensions', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'android-phone' }),
    )
    expect(html).toContain('width:360px')
    expect(html).toContain('height:800px')
  })

  it('renders android-tablet with correct dimensions', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'android-tablet' }),
    )
    expect(html).toContain('width:800px')
    expect(html).toContain('height:1280px')
  })

  it('renders data-notch for iphone', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'iphone' }),
    )
    expect(html).toContain('data-notch="true"')
  })

  it('renders data-home-indicator for ipad', () => {
    const html = renderToString(
      React.createElement(DeviceFrame, { device: 'ipad' }),
    )
    expect(html).toContain('data-home-indicator="true"')
  })
})
