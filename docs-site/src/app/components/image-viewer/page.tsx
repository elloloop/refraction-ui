import { ImageViewerExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const imageViewerProps = [
  {
    name: 'images',
    type: 'ImageViewerImage[]',
    description:
      'The set to show: `{ src, alt, caption?, width?, height? }`. `alt` is required. Declaring the intrinsic `width` / `height` lets the viewer lay the image out before it loads.',
  },
  { name: 'index', type: 'number', description: 'Controlled current image (0-based). Out-of-range values are clamped.' },
  { name: 'defaultIndex', type: 'number', default: '0', description: 'Initial image for uncontrolled usage.' },
  {
    name: 'onIndexChange',
    type: '(index: number) => void',
    description: 'Called when the previous / next buttons or the arrow keys change the image.',
  },
  { name: 'open', type: 'boolean', description: 'Controlled open state.' },
  { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial open state for uncontrolled usage.' },
  {
    name: 'onOpenChange',
    type: '(open: boolean) => void',
    description: 'Called when the viewer opens or closes (trigger, close button, Esc).',
  },
  {
    name: 'trigger',
    type: 'React.ReactElement',
    description:
      'Optional element that opens the viewer. It must forward its ref and props (Dialog adds `onClick`, `aria-expanded`, `aria-haspopup`).',
  },
  {
    name: 'loop',
    type: 'boolean',
    default: 'false',
    description: 'Wrap previous / next at the ends of the set. By default it clamps and the buttons disable at the ends.',
  },
  {
    name: 'actions',
    type: 'React.ReactNode | ((image: ImageViewerImage, index: number) => React.ReactNode)',
    description: 'Toolbar slot for actions such as download or open the original; the function form receives the current image.',
  },
  {
    name: 'labels',
    type: 'Partial<ImageViewerLabels>',
    description:
      'Override any visible or announced string: `dialog`, `close`, `zoomIn`, `zoomOut`, `resetZoom`, `previous`, `next`, `position(index, count)`, `zoom(percent)`.',
  },
  { name: 'className', type: 'string', description: 'Additional CSS classes for the dialog element.' },
]

const usageCode = `import { ImageViewer, IconButton } from '@refraction-ui/react'

const images = [
  { src: '/shots/build.png', alt: 'CI build log with a failed step', caption: 'Build #4821', width: 1600, height: 1000 },
  { src: '/shots/latency.png', alt: 'p95 latency chart spiking at 14:05', width: 1600, height: 1000 },
]

export function Screenshots() {
  const [open, setOpen] = React.useState(false)
  const [index, setIndex] = React.useState(0)

  return (
    <>
      {images.map((image, i) => (
        <button key={image.src} type="button" onClick={() => { setIndex(i); setOpen(true) }}>
          <img src={image.src} alt={image.alt} width={160} />
        </button>
      ))}
      <ImageViewer
        images={images}
        open={open}
        onOpenChange={setOpen}
        index={index}
        onIndexChange={setIndex}
        actions={(image) => (
          <IconButton
            variant="ghost"
            icon={<DownloadIcon />}
            label="Download"
            onClick={() => download(image.src)}
          />
        )}
      />
    </>
  )
}`

export default function ImageViewerPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Image Viewer</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A modal lightbox with zoom up to 8× and pan — for screenshots and images in messages.
          Zoom with the wheel, a pinch, the <code className={code}>+</code> /{' '}
          <code className={code}>−</code> keys or a double-click; drag or use the arrow keys to
          pan; step through a set with previous and next.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          One image with a caption, opened by a <code className={code}>trigger</code>. Double-click
          the image to zoom to 2× where you clicked; double-click again (or press{' '}
          <code className={code}>0</code>) to reset.
        </p>
        <ImageViewerExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Gallery with actions</h2>
        <p className="text-sm text-muted-foreground">
          Controlled <code className={code}>open</code> and <code className={code}>index</code>{' '}
          from a thumbnail grid. The <code className={code}>actions</code> slot adds Download and
          Open original. At 1× the left and right arrow keys switch images; once zoomed they pan.
        </p>
        <ImageViewerExamples section="gallery" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Looping, localised</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>loop</code> wraps previous / next at the ends, and{' '}
          <code className={code}>labels</code> replaces every visible and announced string.
        </p>
        <ImageViewerExamples section="localised" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Keyboard and gestures</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            <code className={code}>+</code> / <code className={code}>=</code> zoom in,{' '}
            <code className={code}>-</code> zooms out, <code className={code}>0</code> resets.
            Zoom is clamped to 1×–8×.
          </li>
          <li>
            Arrow keys <strong>pan when zoomed</strong> (the view moves toward the arrow) and{' '}
            <strong>switch images when not zoomed</strong> (left / right; up / down do nothing at 1×).
          </li>
          <li>
            Mouse wheel zooms around the cursor; a trackpad pinch (reported as ctrl + wheel) and a
            two-finger touch pinch zoom around the fingers. Drag pans; the image can&apos;t be
            dragged out of view.
          </li>
          <li>Double-click toggles between 1× and 2× at the cursor. Esc closes.</li>
          <li>
            Shortcuts with Ctrl, Alt or Meta are left to the browser, and keys typed into a field
            in the actions slot are not intercepted.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Built on <code className={code}>Dialog</code>: <code className={code}>role=&quot;dialog&quot;</code>{' '}
            with <code className={code}>aria-modal</code>, focus moves into the viewer (the Close
            button), Tab is contained, and focus returns to the opener on close.
          </li>
          <li>
            Every control is an <code className={code}>IconButton</code> with a name and a hit area
            of at least 44 × 44 px. Controls at a limit (8×, first / last image) are{' '}
            <code className={code}>aria-disabled</code> rather than disabled, so focus never drops
            out of the modal mid-zoom.
          </li>
          <li>
            The image keeps its <code className={code}>alt</code> text; the caption is a{' '}
            <code className={code}>&lt;figcaption&gt;</code> of the same figure.
          </li>
          <li>
            A polite live region announces &quot;Image 2 of 5&quot; on open and navigation, and the
            zoom level (&quot;Zoom 200%&quot;) when it changes. The position is also shown as text,
            so nothing relies on colour.
          </li>
          <li>
            Zoom transitions are off under <code className={code}>prefers-reduced-motion</code>;
            wheel, drag and pinch never animate (the image follows the input directly).
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={imageViewerProps} />
      </section>
    </div>
  )
}
