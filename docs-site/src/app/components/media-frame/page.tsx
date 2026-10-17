import { MediaFrameExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const mediaFrameProps = [
  {
    name: 'ratio',
    type: "number | '<w>:<h>' | '<w>/<h>'",
    default: '1',
    description:
      'Width ÷ height. An unusable ratio (zero, negative, malformed) falls back to a square and warns in development.',
  },
  {
    name: 'label',
    type: 'React.ReactNode',
    description: 'Optional corner caption, such as a format, size or timestamp.',
  },
  {
    name: 'labelPosition',
    type: "'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'",
    default: "'top-start'",
    description: 'The corner the caption sits in. `start` and `end` follow the writing direction.',
  },
  {
    name: 'tone',
    type: "'default' | 'tertiary'",
    default: "'default'",
    description:
      'The letterbox surface behind the media: the neutral muted surface, or the theme’s tertiary accent.',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description:
      'The media. Position it to fill the frame, for example an `absolute inset-0` image with `object-cover`.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the frame, such as a width or a radius.',
  },
  {
    name: 'style',
    type: 'React.CSSProperties',
    description: 'Inline styles, applied after the computed `aspect-ratio` so they can override it.',
  },
]

const usageCode = `import { MediaFrame } from '@refraction-ui/react'

export function Preview({ src, width, height }: { src: string; width: number; height: number }) {
  return (
    <MediaFrame ratio={width / height} label={\`\${width}×\${height}\`} className="w-64 rounded-md">
      <img src={src} alt="Rendered preview" className="absolute inset-0 h-full w-full object-cover" />
    </MediaFrame>
  )
}`

const astroUsageCode =
  "---\nimport { MediaFrame } from '@refraction-ui/astro'\n---\n\n<MediaFrame ratio=\"16:9\" label=\"1920×1080 · MP4\" class=\"w-64 rounded-md\">\n  <img src=\"/poster.jpg\" alt=\"Rendered preview\" class=\"absolute inset-0 h-full w-full object-cover\" />\n</MediaFrame>"

export default function MediaFramePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Media Frame</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A fixed-aspect box for an image, a video or a live preview, on a
          letterbox surface, with an optional corner caption. The box keeps its
          shape before the media loads, so the layout does not jump.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Ratios</h2>
        <p className="text-sm text-muted-foreground">
          Pass a number or a <code className="text-xs bg-muted px-1 rounded">w:h</code> string.
          The frame exposes its shape as{' '}
          <code className="text-xs bg-muted px-1 rounded">data-orientation</code>{' '}
          (<code className="text-xs bg-muted px-1 rounded">square</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">landscape</code> or{' '}
          <code className="text-xs bg-muted px-1 rounded">portrait</code>) for styling.
        </p>
        <MediaFrameExamples section="ratios" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Fitting media</h2>
        <p className="text-sm text-muted-foreground">
          The frame does not resize its children. Cover the frame to crop, or
          contain the media to show it whole on the letterbox.
        </p>
        <MediaFrameExamples section="fit" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Tone</h2>
        <p className="text-sm text-muted-foreground">
          An empty frame is a placeholder of the right shape.{' '}
          <code className="text-xs bg-muted px-1 rounded">tone=&quot;tertiary&quot;</code>{' '}
          sets the letterbox and caption on the theme’s tertiary accent.
        </p>
        <MediaFrameExamples section="tone" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Caption corners</h2>
        <p className="text-sm text-muted-foreground">
          The caption ignores the pointer, so it never blocks a click on the
          media beneath it.
        </p>
        <MediaFrameExamples section="corners" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react', astro: '@refraction-ui/astro' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: astroUsageCode }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={mediaFrameProps} />
      </section>
    </div>
  )
}
