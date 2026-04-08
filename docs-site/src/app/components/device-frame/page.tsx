import { DeviceFrameExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
const deviceProps = [
  { name: 'device', type: "'iphone' | 'ipad' | 'macbook' | 'browser'", description: 'Device type for the frame.' },
  { name: 'orientation', type: "'portrait' | 'landscape'", default: "'portrait'", description: 'Device orientation.' },
  { name: 'children', type: 'ReactNode', description: 'Content to display inside the frame.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const usageCode = `import { DeviceFrame } from '@refraction-ui/react-device-frame'
export function MyComponent() {
  return (
    <DeviceFrame device="iphone">
      <img src="/screenshot.png" alt="App screenshot" />
    </DeviceFrame>
  )
}`
export default function DeviceFramePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Device Frame</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          iPhone, iPad, and other device mockup frames for showcasing app screenshots.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/device-frame</code> core.
        </p>
      </div>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">iPhone and iPad device frames with content inside.</p>
        <DeviceFrameExamples section="basic" />
      </section>
      <div className="h-px bg-border" />
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock code={usageCode} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={deviceProps} /></section>
    </div>
  )
}
