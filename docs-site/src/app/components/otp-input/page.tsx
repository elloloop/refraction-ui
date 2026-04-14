import { OtpInputExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const otpProps = [
  { name: 'length', type: 'number', default: '6', description: 'Number of OTP digits.' },
  { name: 'value', type: 'string', default: "''", description: 'Controlled value.' },
  { name: 'onChange', type: '(value: string) => void', description: 'Callback when value changes.' },
  { name: 'type', type: "'number' | 'text'", default: "'number'", description: 'Input mode (numeric or alphanumeric).' },
  { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Auto-focus the first input.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all inputs.' },
  { name: 'size', type: "'sm' | 'default' | 'lg'", default: "'default'", description: 'Size of the input slots.' },
]

const usageCode = `import { OtpInput } from '@refraction-ui/react-otp-input'

export function MyComponent() {
  const [otp, setOtp] = useState('')
  return <OtpInput length={6} value={otp} onChange={setOtp} autoFocus />
}`

export default function OtpInputPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">OTP Input</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A row of individual input boxes for one-time password entry. Auto-advance, backspace navigation, and paste support.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/otp-input</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Lengths</h2>
        <p className="text-sm text-muted-foreground">4-digit and 6-digit OTP examples.</p>
        <OtpInputExamples section="lengths" />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Input Types</h2>
        <p className="text-sm text-muted-foreground">Numeric, alphanumeric, and disabled modes.</p>
        <OtpInputExamples section="types" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-otp-input" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={otpProps} />
      </section>
    </div>
  )
}
