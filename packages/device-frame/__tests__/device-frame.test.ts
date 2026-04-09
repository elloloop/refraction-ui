import { describe, it, expect, beforeEach } from 'vitest'
import { resetIdCounter } from '@elloloop/shared'
import { createDeviceFrame, type DeviceType } from '../src/device-frame.js'
import { deviceFrameVariants } from '../src/device-frame.styles.js'

beforeEach(() => {
  resetIdCounter()
})

describe('createDeviceFrame', () => {
  it('returns dimensions for iphone in portrait', () => {
    const api = createDeviceFrame({ device: 'iphone' })
    expect(api.dimensions.width).toBe(375)
    expect(api.dimensions.height).toBe(812)
    expect(api.dimensions.radius).toBe(44)
    expect(api.dimensions.notch).toBe(true)
    expect(api.dimensions.homeIndicator).toBe(true)
  })

  it('returns dimensions for ipad in portrait', () => {
    const api = createDeviceFrame({ device: 'ipad' })
    expect(api.dimensions.width).toBe(810)
    expect(api.dimensions.height).toBe(1080)
    expect(api.dimensions.radius).toBe(18)
    expect(api.dimensions.notch).toBe(false)
    expect(api.dimensions.homeIndicator).toBe(true)
  })

  it('returns dimensions for android-phone in portrait', () => {
    const api = createDeviceFrame({ device: 'android-phone' })
    expect(api.dimensions.width).toBe(360)
    expect(api.dimensions.height).toBe(800)
    expect(api.dimensions.radius).toBe(24)
    expect(api.dimensions.notch).toBe(false)
    expect(api.dimensions.homeIndicator).toBe(false)
  })

  it('returns dimensions for android-tablet in portrait', () => {
    const api = createDeviceFrame({ device: 'android-tablet' })
    expect(api.dimensions.width).toBe(800)
    expect(api.dimensions.height).toBe(1280)
    expect(api.dimensions.radius).toBe(16)
    expect(api.dimensions.notch).toBe(false)
    expect(api.dimensions.homeIndicator).toBe(false)
  })
})

describe('orientation', () => {
  it('defaults to portrait', () => {
    const api = createDeviceFrame({ device: 'iphone' })
    expect(api.dimensions.width).toBe(375)
    expect(api.dimensions.height).toBe(812)
    expect(api.dataAttributes['data-orientation']).toBe('portrait')
  })

  it('swaps width and height in landscape', () => {
    const api = createDeviceFrame({ device: 'iphone', orientation: 'landscape' })
    expect(api.dimensions.width).toBe(812)
    expect(api.dimensions.height).toBe(375)
    expect(api.dataAttributes['data-orientation']).toBe('landscape')
  })

  it('swaps ipad dimensions in landscape', () => {
    const api = createDeviceFrame({ device: 'ipad', orientation: 'landscape' })
    expect(api.dimensions.width).toBe(1080)
    expect(api.dimensions.height).toBe(810)
  })

  it('swaps android-phone dimensions in landscape', () => {
    const api = createDeviceFrame({ device: 'android-phone', orientation: 'landscape' })
    expect(api.dimensions.width).toBe(800)
    expect(api.dimensions.height).toBe(360)
  })

  it('swaps android-tablet dimensions in landscape', () => {
    const api = createDeviceFrame({ device: 'android-tablet', orientation: 'landscape' })
    expect(api.dimensions.width).toBe(1280)
    expect(api.dimensions.height).toBe(800)
  })

  it('preserves radius in landscape', () => {
    const portrait = createDeviceFrame({ device: 'iphone', orientation: 'portrait' })
    const landscape = createDeviceFrame({ device: 'iphone', orientation: 'landscape' })
    expect(portrait.dimensions.radius).toBe(landscape.dimensions.radius)
  })

  it('preserves notch/homeIndicator in landscape', () => {
    const api = createDeviceFrame({ device: 'iphone', orientation: 'landscape' })
    expect(api.dimensions.notch).toBe(true)
    expect(api.dimensions.homeIndicator).toBe(true)
  })
})

describe('device types', () => {
  const devices: DeviceType[] = ['iphone', 'ipad', 'android-phone', 'android-tablet']

  it('all device types return valid dimensions', () => {
    for (const device of devices) {
      const api = createDeviceFrame({ device })
      expect(api.dimensions.width).toBeGreaterThan(0)
      expect(api.dimensions.height).toBeGreaterThan(0)
      expect(api.dimensions.radius).toBeGreaterThan(0)
    }
  })

  it('all device types return data-device attribute', () => {
    for (const device of devices) {
      const api = createDeviceFrame({ device })
      expect(api.dataAttributes['data-device']).toBe(device)
    }
  })

  it('only iphone has notch', () => {
    for (const device of devices) {
      const api = createDeviceFrame({ device })
      if (device === 'iphone') {
        expect(api.dimensions.notch).toBe(true)
        expect(api.dataAttributes['data-notch']).toBe('true')
      } else {
        expect(api.dimensions.notch).toBe(false)
        expect(api.dataAttributes['data-notch']).toBeUndefined()
      }
    }
  })

  it('apple devices have home indicator', () => {
    for (const device of devices) {
      const api = createDeviceFrame({ device })
      if (device === 'iphone' || device === 'ipad') {
        expect(api.dimensions.homeIndicator).toBe(true)
        expect(api.dataAttributes['data-home-indicator']).toBe('true')
      } else {
        expect(api.dimensions.homeIndicator).toBe(false)
        expect(api.dataAttributes['data-home-indicator']).toBeUndefined()
      }
    }
  })
})

describe('ARIA props', () => {
  it('provides img role', () => {
    const api = createDeviceFrame({ device: 'iphone' })
    expect(api.ariaProps.role).toBe('img')
  })

  it('provides descriptive aria-label for iphone portrait', () => {
    const api = createDeviceFrame({ device: 'iphone' })
    expect(api.ariaProps['aria-label']).toBe('iPhone device frame in portrait orientation')
  })

  it('provides descriptive aria-label for ipad landscape', () => {
    const api = createDeviceFrame({ device: 'ipad', orientation: 'landscape' })
    expect(api.ariaProps['aria-label']).toBe('iPad device frame in landscape orientation')
  })

  it('provides descriptive aria-label for android-phone', () => {
    const api = createDeviceFrame({ device: 'android-phone' })
    expect(api.ariaProps['aria-label']).toBe('Android Phone device frame in portrait orientation')
  })

  it('provides descriptive aria-label for android-tablet', () => {
    const api = createDeviceFrame({ device: 'android-tablet', orientation: 'landscape' })
    expect(api.ariaProps['aria-label']).toBe('Android Tablet device frame in landscape orientation')
  })
})

describe('data attributes', () => {
  it('includes data-device', () => {
    const api = createDeviceFrame({ device: 'iphone' })
    expect(api.dataAttributes['data-device']).toBe('iphone')
  })

  it('includes data-orientation', () => {
    const api = createDeviceFrame({ device: 'iphone', orientation: 'landscape' })
    expect(api.dataAttributes['data-orientation']).toBe('landscape')
  })
})

describe('device-frame styles', () => {
  it('exports deviceFrameVariants', () => {
    const classes = deviceFrameVariants()
    expect(classes).toContain('relative')
    expect(classes).toContain('overflow-hidden')
    expect(classes).toContain('shadow-xl')
  })

  it('applies iphone variant', () => {
    const classes = deviceFrameVariants({ device: 'iphone' })
    expect(classes).toContain('rounded-[44px]')
  })

  it('applies ipad variant', () => {
    const classes = deviceFrameVariants({ device: 'ipad' })
    expect(classes).toContain('rounded-[18px]')
  })

  it('applies android-phone variant', () => {
    const classes = deviceFrameVariants({ device: 'android-phone' })
    expect(classes).toContain('rounded-[24px]')
  })

  it('applies android-tablet variant', () => {
    const classes = deviceFrameVariants({ device: 'android-tablet' })
    expect(classes).toContain('rounded-[16px]')
  })
})
