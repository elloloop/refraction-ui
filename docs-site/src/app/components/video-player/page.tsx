import { VideoPlayerExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
const videoProps = [
  { name: 'src', type: 'string', description: 'Video source URL.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const usageCode = `import { VideoPlayer } from '@refraction-ui/react-video-player'
export function MyComponent() {
  return <VideoPlayer src="/video.mp4" />
}`
export default function VideoPlayerPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Video Player</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A video player with custom controls, play/pause, progress bar, and fullscreen support.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/video-player</code> core.
        </p>
      </div>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">A video player with built-in controls.</p>
        <VideoPlayerExamples section="basic" />
      </section>
      <div className="h-px bg-border" />
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock code={usageCode} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={videoProps} /></section>
    </div>
  )
}
