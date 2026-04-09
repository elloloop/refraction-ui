import * as React from 'react'
import {
  createDeviceFrame,
  deviceFrameVariants,
  type DeviceFrameProps as CoreDeviceFrameProps,
  type DeviceType,
  type DeviceOrientation,
} from '@refraction-ui/device-frame'
import { cn } from '@refraction-ui/shared'

// ---------------------------------------------------------------------------
// DeviceFrame
// ---------------------------------------------------------------------------

export interface DeviceFrameProps {
  device: DeviceType
  orientation?: DeviceOrientation
  className?: string
  children?: React.ReactNode
}

export function DeviceFrame({
  device,
  orientation = 'portrait',
  className,
  children,
}: DeviceFrameProps) {
  const api = createDeviceFrame({ device, orientation })

  return React.createElement(
    'div',
    {
      className: cn(deviceFrameVariants({ device, orientation }), className),
      style: {
        width: `${api.dimensions.width}px`,
        height: `${api.dimensions.height}px`,
      },
      ...api.ariaProps,
      ...api.dataAttributes,
    },
    // Notch decoration
    api.dimensions.notch
      ? React.createElement('div', {
          className: 'absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[30px] bg-black rounded-b-2xl z-10',
          'aria-hidden': 'true',
          'data-part': 'notch',
        })
      : null,
    // Screen area
    React.createElement(
      'div',
      {
        className: 'relative w-full h-full overflow-hidden bg-white',
        'data-part': 'screen',
      },
      children,
    ),
    // Home indicator decoration
    api.dimensions.homeIndicator
      ? React.createElement('div', {
          className: 'absolute bottom-2 left-1/2 -translate-x-1/2 w-[35%] h-[5px] bg-gray-300 rounded-full z-10',
          'aria-hidden': 'true',
          'data-part': 'home-indicator',
        })
      : null,
  )
}

DeviceFrame.displayName = 'DeviceFrame'
