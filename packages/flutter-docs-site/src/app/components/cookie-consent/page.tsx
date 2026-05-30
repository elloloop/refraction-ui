import { CookieConsentExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const props = [
  { name: 'consent', type: 'UseCookieConsentResult', description: 'The store + actions from useCookieConsent().' },
  { name: 'position', type: "'bottom' | 'top'", description: 'Banner position. Default bottom.' },
  { name: 'title', type: 'string', description: 'Banner heading.' },
  { name: 'description', type: 'ReactNode', description: 'Banner body text.' },
  { name: 'policyUrl', type: 'string', description: 'Link to the full cookie/privacy policy.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const usageCode = `import { useCookieConsent, CookieConsent } from '@refraction-ui/react-cookie-consent'

export function App() {
  const consent = useCookieConsent({
    version: '2024-01',          // bump to re-prompt after a policy change
    onChange: (prefs) => {
      if (prefs.analytics) loadAnalytics()
    },
  })
  return (
    <>
      {/* your app */}
      <CookieConsent consent={consent} policyUrl="/cookies" />
    </>
  )
}`

export default function CookieConsentPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Cookie Consent</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
          A GDPR-style cookie-consent banner with per-category opt-in (accept all / reject all / save preferences),
          versioned persistence, and a swappable storage adapter (localStorage by default). Built on the headless{' '}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm">@refraction-ui/cookie-consent</code> core.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Example</h2>
        <CookieConsentExamples section="basic" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro: import { CookieConsent } from "@refraction-ui/astro"; listen for rfr:cookie-consent -->' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={props} />
      </section>
    </div>
  )
}
