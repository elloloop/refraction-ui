'use client'

import Link from 'next/link'
import { ThemeDialog } from '../theme-dialog'

const capabilities = [
  {
    title: 'Answer Questions',
    description: 'Get instant, accurate answers across every topic from science to coding to creative writing.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
      </svg>
    ),
  },
  {
    title: 'Write Code',
    description: 'Generate, debug, and refactor code in any language. From algorithms to full-stack apps.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
  },
  {
    title: 'Analyze Data',
    description: 'Upload datasets, get insights, build charts, and find patterns in your data effortlessly.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    title: 'Create Content',
    description: 'Draft emails, blog posts, marketing copy, and creative stories tailored to your voice.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    ),
  },
]

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with basic AI chat capabilities.',
    features: ['50 messages/day', 'Standard model', 'Text-only responses', 'Chat history (7 days)'],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$20',
    period: '/month',
    description: 'For professionals who need advanced AI features.',
    features: ['Unlimited messages', 'All models (GPT-4, Claude)', 'Code execution', 'File uploads', 'Priority access', 'Chat history (unlimited)'],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For teams that need security, control, and scale.',
    features: ['Everything in Pro', 'SSO & SAML', 'Admin dashboard', 'API access', 'Custom models', 'SLA guarantee', 'Dedicated support'],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

const aiTheme = `:root {
  /* AI Chat Brand Colors - clean emerald/teal */
  --background: 0 0% 100%;
  --foreground: 210 11% 15%;
  --card: 0 0% 100%;
  --card-foreground: 210 11% 15%;
  --primary: 160 84% 39%;
  --primary-foreground: 0 0% 100%;
  --secondary: 150 10% 96%;
  --secondary-foreground: 150 5% 40%;
  --accent: 160 50% 94%;
  --accent-foreground: 160 84% 30%;
  --muted: 150 10% 96%;
  --muted-foreground: 210 8% 50%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 210 14% 92%;
  --input: 210 14% 92%;
  --ring: 160 84% 39%;
  --radius: 0.75rem;

  /* Sidebar */
  --sidebar-background: 210 15% 7%;
  --sidebar-foreground: 210 10% 80%;
  --sidebar-primary: 160 84% 50%;
  --sidebar-accent: 210 12% 14%;

  /* Shape */
  --button-radius: 0.75rem;
  --card-radius: 0.75rem;
  --avatar-radius: 9999px;
  --badge-radius: 9999px;
}`

export default function AIChatLandingPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{
        '--primary': '160 84% 39%',
        '--primary-foreground': '0 0% 100%',
        '--accent': '160 50% 94%',
        '--accent-foreground': '160 84% 30%',
      } as React.CSSProperties}
    >
      {/* Nav */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">NovaMind</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">Features</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Pricing</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">API</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Docs</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/examples/ai-chat/app" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link
              href="/examples/ai-chat/app"
              className="rounded-[var(--button-radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Start Chatting
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-28 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
          <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
          Powered by state-of-the-art language models
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
          Your AI
          <span className="text-gradient bg-gradient-to-r from-primary via-emerald-400 to-teal-400 block">
            Assistant
          </span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Ask anything, write code, analyze data, and create content. NovaMind understands context, remembers your preferences, and gets smarter with every conversation.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/examples/ai-chat/app"
            className="rounded-[var(--button-radius)] bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            Start chatting — it&apos;s free
          </Link>
        </div>
      </section>

      {/* Capabilities */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">What NovaMind can do</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            From quick answers to complex multi-step tasks, NovaMind adapts to how you work.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((cap) => (
              <div
                key={cap.title}
                className="rounded-[var(--card-radius)] border border-border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {cap.icon}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo conversation */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">See it in action</h2>
          <div className="rounded-[var(--card-radius)] border border-border bg-card shadow-lg overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary/60" />
              <span className="text-sm font-medium text-foreground">NovaMind</span>
              <span className="text-xs text-muted-foreground ml-auto">Model: Nova-4</span>
            </div>
            <div className="p-6 space-y-6">
              {/* User message */}
              <div className="flex justify-end">
                <div className="rounded-[var(--radius)] bg-primary/10 px-4 py-3 max-w-md">
                  <p className="text-sm text-foreground">Write a Python function that finds all prime numbers up to n.</p>
                </div>
              </div>
              {/* Assistant message */}
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground mb-3">Here is an efficient Sieve of Eratosthenes implementation:</p>
                  <pre className="rounded-[var(--radius)] border border-border bg-muted/70 p-4 overflow-x-auto">
                    <code className="text-xs font-mono text-foreground">{`def sieve_of_eratosthenes(n: int) -> list[int]:
    """Find all prime numbers up to n."""
    if n < 2:
        return []

    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False

    for i in range(2, int(n**0.5) + 1):
        if is_prime[i]:
            for j in range(i*i, n + 1, i):
                is_prime[j] = False

    return [i for i in range(n + 1) if is_prime[i]]`}</code>
                  </pre>
                  <p className="text-sm text-foreground mt-3">Time complexity: O(n log log n). This is optimal for generating all primes up to n.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-muted/30 py-20" id="pricing">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">Simple pricing</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Start for free, upgrade when you need more.
          </p>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[var(--card-radius)] border bg-card p-6 flex flex-col ${
                  plan.highlighted
                    ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20'
                    : 'border-border'
                }`}
              >
                {plan.highlighted && (
                  <span className="inline-block self-start rounded-[var(--badge-radius)] bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground mb-3">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <ul className="mt-6 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <svg className="h-4 w-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/examples/ai-chat/app"
                  className={`mt-6 block text-center rounded-[var(--button-radius)] px-4 py-2.5 text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-primary text-primary-foreground hover:opacity-90'
                      : 'border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 sm:grid-cols-4">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-foreground cursor-pointer transition-colors">Features</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Models</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Pricing</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Changelog</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Developers</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-foreground cursor-pointer transition-colors">API Docs</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Libraries</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Playground</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Status</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-foreground cursor-pointer transition-colors">About</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Blog</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Careers</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Research</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Legal</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-foreground cursor-pointer transition-colors">Privacy</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Terms</p>
                <Link href="/examples" className="hover:text-foreground transition-colors block">All Examples</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            Built with refraction-ui. Themed by CSS variables only.
          </div>
        </div>
      </footer>

      <ThemeDialog themeName="NovaMind (AI Chat)" themeConfig={aiTheme} />
    </div>
  )
}
