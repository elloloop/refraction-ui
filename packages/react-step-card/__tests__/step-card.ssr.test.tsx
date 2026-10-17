import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { StepCard, InstructionList } from '../src/index.js'
import { STEP_STATUSES } from '@refraction-ui/step-card'

const MIC_ICON = <svg data-testid="mic" />

function render(ui: React.ReactElement): string {
  return renderToString(ui)
}

describe('StepCard (SSR)', () => {
  it('renders a group named by its title heading', () => {
    const html = render(<StepCard title="Microphone" />)
    expect(html).toContain('role="group"')
    const id = /<h3 id="([^"]+)"/.exec(html)?.[1]
    expect(id).toBeTruthy()
    expect(html).toContain(`aria-labelledby="${id}"`)
    expect(html).toContain('>Microphone</h3>')
  })

  it('defaults to notDetermined with a visible "Not checked yet" label', () => {
    const html = render(<StepCard title="Microphone" />)
    expect(html).toContain('data-status="notDetermined"')
    expect(html).toContain('Not checked yet')
  })

  it('every status renders an icon and text in the pill, never colour alone', () => {
    for (const status of STEP_STATUSES) {
      const html = render(<StepCard title="Mic" status={status} />)
      const pill = /<span[^>]*data-slot="step-card-status"[^>]*>([\s\S]*?)<\/span>/.exec(html)?.[1] ?? ''
      expect(pill).toContain('<svg')
      expect(pill).toContain('aria-hidden="true"')
      expect(pill.replace(/<[^>]+>/g, '').trim().length).toBeGreaterThan(0)
    }
  })

  it('uses statusLabel when given', () => {
    const html = render(<StepCard title="Mic" status="failed" statusLabel="Denied in Settings" />)
    expect(html).toContain('Denied in Settings')
    expect(html).not.toContain('>Failed<')
  })

  it('spins the checking icon but stops it under reduced motion', () => {
    const html = render(<StepCard title="Mic" status="checking" />)
    expect(html).toContain('animate-spin')
    expect(html).toContain('motion-reduce:animate-none')
    expect(render(<StepCard title="Mic" status="granted" />)).not.toContain('animate-spin')
  })

  it('renders the icon decoratively and the reason', () => {
    const html = render(<StepCard title="Mic" icon={MIC_ICON} reason="So others can hear you." />)
    expect(html).toContain('aria-hidden="true" data-slot="step-card-icon"')
    expect(html).toContain('data-testid="mic"')
    expect(html).toContain('So others can hear you.')
  })

  it('renders an empty polite live region on first render', () => {
    const html = render(<StepCard title="Mic" status="needed" />)
    expect(html).toMatch(
      /<span role="status" aria-live="polite" aria-atomic="true" class="sr-only" data-slot="step-card-announcer"><\/span>/,
    )
  })

  it('shows the live hint only while checking', () => {
    const hint = 'Toggle Refraction on in System Settings.'
    expect(render(<StepCard title="Mic" status="checking" liveHint={hint} />)).toContain(hint)
    expect(render(<StepCard title="Mic" status="needed" liveHint={hint} />)).not.toContain(hint)
  })

  it('renders numbered instructions through MarkupText with inline nodes', () => {
    const html = render(
      <StepCard
        title="Mic"
        instructionsTitle="How to allow it"
        instructions={['**Open Settings**', 'Turn on {app}']}
        inline={{ app: <kbd>Refraction</kbd> }}
      />,
    )
    expect(html).toContain('<ol')
    expect(html).toContain('How to allow it')
    expect(html).toContain('<strong')
    expect(html).toContain('Open Settings</strong>')
    expect(html).toContain('<kbd>Refraction</kbd>')
    expect(html).not.toContain('{app}')
    expect(html).not.toContain('**')
  })

  it('renders one action button only when actionLabel is set', () => {
    const html = render(<StepCard title="Mic" actionLabel="Open Settings" />)
    expect(html.match(/data-slot="step-card-action"/g)?.length).toBe(1)
    expect(html).toContain('type="button"')
    expect(html).toContain('Open Settings')
    expect(render(<StepCard title="Mic" />)).not.toContain('step-card-action')
  })

  it('renders troubleshooting as a closed disclosure with the default title', () => {
    const html = render(<StepCard title="Mic" troubleshooting="Restart the app." />)
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-controls=')
    expect(html).toContain('Having trouble?')
    // Closed content is not in the DOM.
    expect(html).not.toContain('Restart the app.')
  })

  it('uses troubleshootingTitle', () => {
    const html = render(
      <StepCard title="Mic" troubleshooting={['A', 'B']} troubleshootingTitle="Still not working?" />,
    )
    expect(html).toContain('Still not working?')
  })

  it('collapsed cards hide instructions, action and troubleshooting', () => {
    const html = render(
      <StepCard
        title="Mic"
        reason="Why"
        expanded={false}
        instructions={['Step one']}
        actionLabel="Open Settings"
        troubleshooting="Tip"
      />,
    )
    expect(html).toContain('data-expanded="false"')
    expect(html).toContain('Why')
    expect(html).not.toContain('Step one')
    expect(html).not.toContain('Open Settings')
    expect(html).not.toContain('Having trouble?')
    expect(html).not.toContain('step-card-body')
  })

  it('forwards className and DOM props', () => {
    const html = render(<StepCard title="Mic" className="custom" id="mic-step" />)
    expect(html).toContain('custom')
    expect(html).toContain('id="mic-step"')
    expect(html).toContain('bg-card')
  })
})

describe('InstructionList (SSR)', () => {
  it('renders an ordered list in a muted well', () => {
    const html = render(<InstructionList steps={['One', 'Two']} />)
    expect(html).toContain('data-slot="instruction-list"')
    expect(html).toContain('bg-muted')
    expect(html).toContain('<ol')
    expect(html).toContain('list-decimal')
    expect(html.match(/<li/g)?.length).toBe(2)
  })

  it('names the list by its title', () => {
    const html = render(<InstructionList title="Do this" steps={['One']} />)
    const id = /<p id="([^"]+)"/.exec(html)?.[1]
    expect(id).toBeTruthy()
    expect(html).toContain(`aria-labelledby="${id}"`)
  })

  it('has no aria-labelledby without a title', () => {
    expect(render(<InstructionList steps={['One']} />)).not.toContain('aria-labelledby')
  })

  it('bolds **text** and places {token} nodes', () => {
    const html = render(
      <InstructionList
        steps={['Press {key} then **Allow**']}
        inline={{ key: <kbd>⌘ ,</kbd> }}
      />,
    )
    expect(html).toContain('<kbd>⌘ ,</kbd>')
    expect(html).toContain('Allow</strong>')
  })

  it('drops blank steps and renders nothing when none remain', () => {
    expect(render(<InstructionList steps={['One', '  ']} />).match(/<li/g)?.length).toBe(1)
    expect(render(<InstructionList steps={[' ']} />)).toBe('')
  })
})
