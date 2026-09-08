import { MotionExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const pageTransitionProps = [
  { name: 'step', type: 'number', default: '0', description: 'Current step index. A higher index plays the forward pattern, a lower one the back pattern; each change re-keys the page so the animation re-fires.' },
  { name: 'direction', type: "'forward' | 'back'", description: 'Explicit direction for flows that are not index-based. Overrides `step`-derived direction.' },
  { name: 'axis', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Vertical for parent-side wizards; horizontal filmstrip for a child stepping through a lesson.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Skip the animation — content just appears.' },
  { name: 'speed', type: "'slow' | 'relaxed' | 'default' | 'brisk' | 'fast' | number", default: "'default'", description: 'Playback speed multiplier on every duration and delay. Named steps are 0.5x, 0.75x, 1x, 1.5x and 2x; any number in 0.1–5 also works. Set it per component, or set `--rfr-motion-speed` on a container to re-time a whole region.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes to apply.' },
]

const revealProps = [
  { name: 'pattern', type: 'MotionPattern', description: "One of 'page-in' | 'page-back' | 'side-next' | 'side-prev' | 'fold-in' | 'sheet-in' | 'scrim-in' | 'handoff' | 'celebrate' | 'grow' | 'nudge' | 'icon-swap' | 'num-pop' | 'check-draw'." },
  { name: 'delayMs', type: 'number', default: '0', description: 'Extra delay before the animation starts.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Skip the animation.' },
  { name: 'speed', type: "'slow' | 'relaxed' | 'default' | 'brisk' | 'fast' | number", default: "'default'", description: 'Playback speed multiplier on every duration and delay. Named steps are 0.5x, 0.75x, 1x, 1.5x and 2x; any number in 0.1–5 also works. Set it per component, or set `--rfr-motion-speed` on a container to re-time a whole region.' },
  { name: 'as', type: 'keyof JSX.IntrinsicElements', default: "'div'", description: 'Element to render.' },
  { name: 'key', type: 'React.Key', description: 'Change the key to remount and play the pattern again.' },
]

const staggerProps = [
  { name: 'stepMs', type: 'number', default: '45', description: 'Milliseconds between children.' },
  { name: 'cap', type: 'number', default: '8', description: 'Children beyond this index share the last delay — past eight a stagger reads as slow, not considerate.' },
  { name: 'pattern', type: "'page-in' | 'side-next' | 'handoff' | 'celebrate'", default: "'page-in'", description: 'Arrival pattern for each child.' },
  { name: 'layout', type: "'stack' | 'grid' | 'inline' | 'none'", default: "'none'", description: 'Optional layout classes for the group.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Skip the animation.' },
  { name: 'speed', type: "'slow' | 'relaxed' | 'default' | 'brisk' | 'fast' | number", default: "'default'", description: 'Playback speed multiplier on every duration and delay. Named steps are 0.5x, 0.75x, 1x, 1.5x and 2x; any number in 0.1–5 also works. Set it per component, or set `--rfr-motion-speed` on a container to re-time a whole region.' },
]

const checkDrawProps = [
  { name: 'size', type: 'number', default: '24', description: 'Box size in px.' },
  { name: 'strokeWidth', type: 'number', default: '2.5', description: 'Stroke width.' },
  { name: 'delayMs', type: 'number', default: '0', description: 'Extra delay before the stroke starts drawing.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Show the finished check without drawing.' },
  { name: 'speed', type: "'slow' | 'relaxed' | 'default' | 'brisk' | 'fast' | number", default: "'default'", description: 'Playback speed multiplier on every duration and delay. Named steps are 0.5x, 0.75x, 1x, 1.5x and 2x; any number in 0.1–5 also works. Set it per component, or set `--rfr-motion-speed` on a container to re-time a whole region.' },
  { name: 'label', type: 'string', description: 'Accessible name. Omit for a decorative mark.' },
]

const usageCode = `import { PageTransition, Stagger, Reveal, CheckDraw } from '@refraction-ui/react'

export function Onboarding() {
  const [step, setStep] = React.useState(0)

  return (
    <>
      {/* Forward rises from below, back settles from above — direction tells you which way you went. */}
      <PageTransition step={step}>
        <StepContent step={step} />
      </PageTransition>

      {/* Tiles arrive 45ms apart, eight at most. */}
      <Stagger layout="grid" className="grid-cols-3 gap-3">
        {subjects.map((s) => <SubjectTile key={s.id} {...s} />)}
      </Stagger>

      {/* The one bounce in the system: a badge arriving. Change the key to play it again. */}
      <Reveal key={badgeId} pattern="celebrate">
        <CheckDraw label="Badge earned" />
      </Reveal>
    </>
  )
}`

const astroCode = `---
import { PageTransition, Stagger, Reveal } from '@refraction-ui/astro'
---
<PageTransition direction="forward">
  <h1>Who is learning?</h1>
</PageTransition>

<Stagger layout="grid" class="grid-cols-3 gap-3">
  <div>Reading</div>
  <div>Maths</div>
  <div>Science</div>
</Stagger>

<Reveal pattern="celebrate">Badge earned</Reveal>`

const patternRows = [
  ['page-in / page-back', 'Step and screen transitions. Forward arrives from below, back from above, so direction always tells you which way you went. Re-fires via a changing key.', 'Onboarding flows, kid app screens'],
  ['side-next / side-prev', 'Horizontal sibling motion for flows that read as a filmstrip.', 'A child stepping through a lesson'],
  ['stagger', 'Children arrive 45ms apart, eight maximum. Leads the eye through a grid instead of dumping it.', 'Subject grids, badge shelf, marketing sections'],
  ['fold-in', 'A finished step slides sideways into the rail as an editable summary card.', 'Parent onboarding, any wizard'],
  ['sheet-in / scrim-in', 'A bottom sheet settles up over a fading scrim. Settles, never snaps.', 'App sheets, help'],
  ['handoff', 'A tapped tile grows into the header of the screen it opens, so a child never loses track of what they touched.', 'Kid app lesson open'],
  ['celebrate', 'The one bounce in the system: a badge arriving. Once, 700ms, never looped, never on navigation.', 'Badge and reward moments'],
  ['grow', 'Progress grows from its previous value, so a completion is visibly earned rather than silently rewritten.', 'Progress bars'],
  ['nudge', 'Two pulses maximum, only to point at the next action after inactivity. Never on load, never on an error.', 'Rare'],
  ['icon-swap', 'A glyph replaces another without morphing (scale + blur).', 'Unrelated icon swaps'],
  ['check-draw', 'Success is drawn, not popped in: the stroke writes itself.', 'Saved, done, earned'],
  ['num-pop', 'A changed count rises and sharpens, so earned points register.', 'Counters, streak days'],
]

export default function MotionPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Motion</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Named page transitions and reveals — the choreography every screen is
          built from. Short and soft: 160ms for controls, 240ms for surfaces,
          arriving elements on an emphasised ease, a bounce reserved for
          celebration. Fades and small position shifts only; every pattern is
          inert under <code className="text-xs bg-muted px-1 rounded">prefers-reduced-motion</code>.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Two rules</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">One moving object at a time.</strong> When a
            step completes, one card travels — the whole layout does not reflow.
          </li>
          <li>
            <strong className="text-foreground">Motion carries meaning or it does not happen.</strong>{' '}
            Every pattern answers “where did this come from” or “what just changed”.
            Product surfaces animate on navigation only, never on idle.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Page transition</h2>
        <p className="text-sm text-muted-foreground">
          Forward moves content up into place, back moves it down — the direction
          always tells you which way you went. Pass a changing{' '}
          <code className="text-xs bg-muted px-1 rounded">step</code> and the page is re-keyed so the animation re-fires.
        </p>
        <MotionExamples section="page" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Staggered reveal</h2>
        <p className="text-sm text-muted-foreground">
          Lists and tile grids arrive one after another, 45ms apart, capped at
          eight children — beyond that it reads as slow, not considerate.
        </p>
        <MotionExamples section="stagger" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Celebration</h2>
        <p className="text-sm text-muted-foreground">
          The one place a bounce is allowed: a badge or reward arriving. Once,
          700ms, never looped, never on navigation. Pair with{' '}
          <code className="text-xs bg-muted px-1 rounded">num-pop</code> so the earned count registers.
        </p>
        <MotionExamples section="celebrate" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Drawn check</h2>
        <p className="text-sm text-muted-foreground">
          Success is drawn, not popped in: the stroke writes itself on an SVG
          path with <code className="text-xs bg-muted px-1 rounded">pathLength=&quot;1&quot;</code>.
        </p>
        <MotionExamples section="check" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">All patterns</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-xs bg-muted px-1 rounded">Reveal</code> plays any named pattern on any element. Every
          component takes a <code className="text-xs bg-muted px-1 rounded">speed</code> prop with the designed tempo as
          its default, so a product can offer a small, sane set of speeds rather than a free number field.
        </p>
        <MotionExamples section="patterns" />
        <p className="text-sm text-muted-foreground">
          Speed is a multiplier on every duration and delay: <code className="text-xs bg-muted px-1 rounded">slow</code>{' '}
          0.5x, <code className="text-xs bg-muted px-1 rounded">relaxed</code> 0.75x,{' '}
          <code className="text-xs bg-muted px-1 rounded">default</code> 1x,{' '}
          <code className="text-xs bg-muted px-1 rounded">brisk</code> 1.5x and{' '}
          <code className="text-xs bg-muted px-1 rounded">fast</code> 2x, or any number between 0.1 and 5. It is one CSS
          custom property underneath, so setting{' '}
          <code className="text-xs bg-muted px-1 rounded">--rfr-motion-speed</code> on a container re-times every
          animation inside it without touching a single component.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Pattern</th>
                <th className="px-4 py-2 font-medium">What it does</th>
                <th className="px-4 py-2 font-medium">Where</th>
              </tr>
            </thead>
            <tbody>
              {patternRows.map(([name, what, where]) => (
                <tr key={name} className="border-t border-border align-top">
                  <td className="px-4 py-2 font-mono text-xs text-foreground whitespace-nowrap">{name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{what}</td>
                  <td className="px-4 py-2 text-muted-foreground">{where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        <h2 className="text-xl font-semibold tracking-tight text-foreground">PageTransition props</h2>
        <PropsTable props={pageTransitionProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Reveal props</h2>
        <PropsTable props={revealProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Stagger props</h2>
        <PropsTable props={staggerProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">CheckDraw props</h2>
        <PropsTable props={checkDrawProps} />
      </section>
    </div>
  )
}
