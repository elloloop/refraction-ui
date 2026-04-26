'use client'
import { DeviceFrame } from '@refraction-ui/react-device-frame'
interface DeviceFrameExamplesProps { section: 'basic' }
export function DeviceFrameExamples({ section }: DeviceFrameExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start gap-8">
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">iPhone</span>
            <DeviceFrame device="iphone" className="w-48">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs h-full flex items-center justify-center">
                App Preview
              </div>
            </DeviceFrame>
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">iPad</span>
            <DeviceFrame device="ipad" className="w-64">
              <div className="p-4 bg-gradient-to-br from-green-500 to-teal-500 text-white text-xs h-full flex items-center justify-center">
                Tablet Preview
              </div>
            </DeviceFrame>
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Macbook</span>
            <DeviceFrame device="macbook" className="w-80">
              <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs h-full flex items-center justify-center">
                Desktop App
              </div>
            </DeviceFrame>
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Browser</span>
            <DeviceFrame device="browser" className="w-80">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-500 text-white text-xs h-full flex items-center justify-center">
                Web Application
              </div>
            </DeviceFrame>
          </div>
        </div>
      </div>
    )
  }
  return null
}
