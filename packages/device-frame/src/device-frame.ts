import type { AccessibilityProps } from '@refraction-ui/shared'

export type DeviceType = 'iphone' | 'ipad' | 'android-phone' | 'android-tablet'
export type DeviceOrientation = 'portrait' | 'landscape'

export interface DeviceFrameProps {
  /** The type of device to display */
  device: DeviceType
  /** The orientation of the device */
  orientation?: DeviceOrientation
}

export interface DeviceDimensions {
  /** Width in pixels */
  width: number
  /** Height in pixels */
  height: number
  /** Border radius in pixels */
  radius: number
  /** Whether the device has a notch */
  notch: boolean
  /** Whether the device has a home indicator bar */
  homeIndicator: boolean
}

export interface DeviceFrameAPI {
  /** Computed dimensions for the device */
  dimensions: DeviceDimensions
  /** ARIA attributes for the device frame */
  ariaProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** Data attributes for styling hooks */
  dataAttributes: Record<string, string>
}

interface DeviceSpec {
  width: number
  height: number
  radius: number
  notch: boolean
  homeIndicator: boolean
}

const DEVICE_SPECS: Record<DeviceType, DeviceSpec> = {
  iphone: {
    width: 375,
    height: 812,
    radius: 44,
    notch: true,
    homeIndicator: true,
  },
  ipad: {
    width: 810,
    height: 1080,
    radius: 18,
    notch: false,
    homeIndicator: true,
  },
  'android-phone': {
    width: 360,
    height: 800,
    radius: 24,
    notch: false,
    homeIndicator: false,
  },
  'android-tablet': {
    width: 800,
    height: 1280,
    radius: 16,
    notch: false,
    homeIndicator: false,
  },
}

const DEVICE_LABELS: Record<DeviceType, string> = {
  iphone: 'iPhone',
  ipad: 'iPad',
  'android-phone': 'Android Phone',
  'android-tablet': 'Android Tablet',
}

export function createDeviceFrame(props: DeviceFrameProps): DeviceFrameAPI {
  const { device, orientation = 'portrait' } = props
  const spec = DEVICE_SPECS[device]

  const isLandscape = orientation === 'landscape'

  const dimensions: DeviceDimensions = {
    width: isLandscape ? spec.height : spec.width,
    height: isLandscape ? spec.width : spec.height,
    radius: spec.radius,
    notch: spec.notch,
    homeIndicator: spec.homeIndicator,
  }

  const ariaProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    role: 'img',
    'aria-label': `${DEVICE_LABELS[device]} device frame in ${orientation} orientation`,
  }

  const dataAttributes: Record<string, string> = {
    'data-device': device,
    'data-orientation': orientation,
    ...(spec.notch ? { 'data-notch': 'true' } : {}),
    ...(spec.homeIndicator ? { 'data-home-indicator': 'true' } : {}),
  }

  return {
    dimensions,
    ariaProps,
    dataAttributes,
  }
}
