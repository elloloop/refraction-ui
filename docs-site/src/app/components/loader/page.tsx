import { LoaderExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const spinnerProps = [
  {
    name: 'variant',
    type: "'ring' | 'dots' | 'bars' | 'orbit' | 'ripple'",
    default: "'ring'",
    description: 'Spinner shape.',
  },
  {
    name: 'size',
    type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
    default: "'md'",
    description: 'Visual size (12–56px).',
  },
  {
    name: 'tone',
    type: "'primary' | 'tertiary' | 'muted' | 'inverse' | 'current'",
    default: "'primary'",
    description: 'Colour role. `current` inherits the surrounding text colour (use inside buttons).',
  },
  {
    name: 'label',
    type: 'string',
    default: "'Loading'",
    description: 'Accessible name announced by screen readers.',
  },
  {
    name: 'decorative',
    type: 'boolean',
    default: 'false',
    description: 'Hide from assistive tech when a parent control already reports `aria-busy`.',
  },
  {
    name: 'speed',
    type: 'number',
    default: '1',
    description: 'Playback speed multiplier.',
  },
  { name: 'className', type: 'string', description: 'Additional CSS classes to apply.' },
]

const loadingBarProps = [
  {
    name: 'value',
    type: 'number',
    description: 'Percentage complete (0–100). Omit for an indeterminate sweep.',
  },
  {
    name: 'placement',
    type: "'fixed' | 'inline'",
    default: "'inline'",
    description: 'Pin to the top of the viewport, or sit in flow.',
  },
  {
    name: 'tone',
    type: "'primary' | 'tertiary' | 'muted' | 'inverse' | 'current'",
    default: "'primary'",
    description: 'Colour role.',
  },
  {
    name: 'thickness',
    type: 'number | string',
    default: '3px',
    description: 'Track thickness.',
  },
  {
    name: 'label',
    type: 'string',
    default: "'Loading page'",
    description: 'Accessible name.',
  },
  {
    name: 'active (PageLoadingBar)',
    type: 'boolean',
    description:
      'For `PageLoadingBar` only: true while a navigation is in flight. The bar trickles, sprints to 100% and fades.',
  },
]

const overlayProps = [
  {
    name: 'open',
    type: 'boolean',
    default: 'true',
    description: 'Whether the overlay is shown. Unmounts entirely when false.',
  },
  {
    name: 'scope',
    type: "'fullscreen' | 'contain'",
    default: "'fullscreen'",
    description: 'Cover the viewport, or the nearest `position: relative` ancestor.',
  },
  {
    name: 'blur',
    type: 'boolean',
    default: 'true',
    description: 'Blur the content behind the scrim.',
  },
  {
    name: 'message',
    type: 'React.ReactNode',
    description: 'Visible message under the indicator.',
  },
  {
    name: 'label',
    type: 'string',
    description: 'Accessible name when `message` is not a plain string.',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'Custom indicator. Defaults to a large ring `Spinner`.',
  },
]

const usageCode = `import {
  Spinner,
  PageLoadingBar,
  LoadingOverlay,
  useDelayedLoading,
} from '@refraction-ui/react'

export function LessonRoute({ navigating, lesson }) {
  // Only show the overlay after 150ms, and keep it for at least 500ms.
  const showOverlay = useDelayedLoading(navigating)

  return (
    <>
      {/* Thin bar at the top edge for every route change */}
      <PageLoadingBar active={navigating} />

      {/* Full-screen scrim for the big moves */}
      <LoadingOverlay open={showOverlay} message="Loading lesson" />

      <button disabled={!lesson} aria-busy={!lesson}>
        {!lesson && <Spinner size="sm" tone="current" decorative />}
        Start lesson
      </button>
    </>
  )
}`

const astroCode = `---
import { Spinner, LoadingBar, LoadingOverlay } from '@refraction-ui/astro'
---

<LoadingBar placement="fixed" label="Loading page" />

<LoadingOverlay message="Loading lesson" />

<Spinner variant="dots" size="sm" tone="current" decorative />`

export default function LoaderPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Loader</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Everything a wait needs: a <code className="text-xs bg-muted px-1 rounded">Spinner</code> in five shapes, a
          top-of-page <code className="text-xs bg-muted px-1 rounded">LoadingBar</code> for route changes, a{' '}
          <code className="text-xs bg-muted px-1 rounded">LoadingOverlay</code> scrim. All of
          them are polite live regions, take their colour from the theme, and collapse to a slow pulse under{' '}
          <code className="text-xs bg-muted px-1 rounded">prefers-reduced-motion</code>.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Spinner shapes</h2>
        <p className="text-sm text-muted-foreground">
          Ring is the default. Dots and bars suit inline text; orbit and ripple are quieter for larger empty areas.
        </p>
        <LoaderExamples section="spinners" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sizes and tones</h2>
        <p className="text-sm text-muted-foreground">
          Five sizes from 12px to 56px. Tones map to theme roles; <code className="text-xs bg-muted px-1 rounded">current</code>{' '}
          inherits whatever text colour surrounds it.
        </p>
        <LoaderExamples section="sizes" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Inside buttons</h2>
        <p className="text-sm text-muted-foreground">
          Mark the spinner <code className="text-xs bg-muted px-1 rounded">decorative</code> and put{' '}
          <code className="text-xs bg-muted px-1 rounded">aria-busy</code> on the button so the state is announced once,
          not twice.
        </p>
        <LoaderExamples section="buttons" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Loading bar</h2>
        <p className="text-sm text-muted-foreground">
          Indeterminate sweeps; determinate values expose the full{' '}
          <code className="text-xs bg-muted px-1 rounded">role=&quot;progressbar&quot;</code> triple.
        </p>
        <LoaderExamples section="bars" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Page transitions</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-xs bg-muted px-1 rounded">PageLoadingBar</code> takes one boolean. While active it
          trickles towards 94% in ever-smaller steps; when the page lands it sprints to 100% and fades. Drop it once at
          your app root with <code className="text-xs bg-muted px-1 rounded">placement=&quot;fixed&quot;</code> (the
          default).
        </p>
        <LoaderExamples section="page-transition" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Overlay</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-xs bg-muted px-1 rounded">scope=&quot;contain&quot;</code> covers the nearest positioned
          ancestor; <code className="text-xs bg-muted px-1 rounded">fullscreen</code> covers the viewport. Pass any
          indicator as children.
        </p>
        <LoaderExamples section="overlay" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Delay and minimum duration</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-xs bg-muted px-1 rounded">useDelayedLoading(pending)</code> gates any loader: hidden for
          the first 150ms, then shown for at least 500ms. The state machine is pure and lives in the headless core.
        </p>
        <LoaderExamples section="delayed" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react', astro: '@refraction-ui/astro' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: astroCode }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Spinner props</h2>
        <PropsTable props={spinnerProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">LoadingBar / PageLoadingBar props</h2>
        <PropsTable props={loadingBarProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">LoadingOverlay props</h2>
        <PropsTable props={overlayProps} />
      </section>

    </div>
  )
}
