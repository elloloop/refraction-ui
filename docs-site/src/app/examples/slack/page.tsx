'use client'

import Link from 'next/link'
import { ThemeDialog } from '../theme-dialog'

const features = [
  {
    title: 'Channels',
    description: 'Organize conversations by topic, project, or team. Keep everything searchable.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
      </svg>
    ),
  },
  {
    title: 'Direct Messages',
    description: 'Private conversations with teammates. Share files, code, and ideas one-on-one.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    ),
  },
  {
    title: 'Integrations',
    description: 'Connect your tools: GitHub, Jira, Google Drive, and 2,400+ more apps.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />
      </svg>
    ),
  },
  {
    title: 'Search',
    description: 'Find any message, file, or conversation instantly across your entire workspace.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
]

const slackTheme = `:root {
  /* Slack Brand Colors */
  --background: 0 0% 100%;
  --foreground: 213 13% 16%;
  --card: 0 0% 100%;
  --card-foreground: 213 13% 16%;
  --primary: 283 70% 45%;
  --primary-foreground: 0 0% 100%;
  --secondary: 240 5% 96%;
  --secondary-foreground: 213 13% 40%;
  --accent: 283 40% 95%;
  --accent-foreground: 283 70% 35%;
  --muted: 220 14% 96%;
  --muted-foreground: 220 9% 46%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --success: 154 64% 40%;
  --warning: 38 92% 50%;
  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 283 70% 45%;
  --radius: 0.5rem;

  /* Sidebar uses Slack's signature dark aubergine */
  --sidebar-background: 283 35% 18%;
  --sidebar-foreground: 280 20% 85%;
  --sidebar-primary: 0 0% 100%;
  --sidebar-primary-foreground: 283 35% 18%;
  --sidebar-accent: 283 30% 25%;
  --sidebar-accent-foreground: 0 0% 100%;
  --sidebar-border: 283 25% 25%;

  /* Shape */
  --button-radius: 0.375rem;
  --card-radius: 0.5rem;
  --avatar-radius: 0.375rem;
  --badge-radius: 9999px;
}`

export default function SlackLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground"
      style={{
        '--primary': '283 70% 45%',
        '--primary-foreground': '0 0% 100%',
        '--accent': '283 40% 95%',
        '--accent-foreground': '283 70% 35%',
      } as React.CSSProperties}
    >
      {/* Nav */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-[var(--radius)] bg-primary flex items-center justify-center">
              <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">TeamChat</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">Product</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Solutions</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Pricing</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Resources</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/examples/slack/app" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link
              href="/examples/slack/app"
              className="rounded-[var(--button-radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
          Where work
          <span className="text-gradient bg-gradient-to-r from-primary to-primary/60 block">
            happens
          </span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          TeamChat brings your team together with channels, messages, and integrations that make work simpler, more pleasant, and more productive.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/examples/slack/app"
            className="rounded-[var(--button-radius)] bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            Get Started Free
          </Link>
          <Link
            href="/examples/slack/app"
            className="rounded-[var(--button-radius)] border border-border bg-card px-8 py-3 text-base font-semibold text-foreground hover:bg-muted transition-colors"
          >
            See Demo
          </Link>
        </div>
      </section>

      {/* App preview */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="rounded-[var(--card-radius)] border border-border bg-card shadow-xl overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-4 py-2.5 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
              <div className="h-3 w-3 rounded-full bg-green-400/60" />
            </div>
          </div>
          <div className="flex h-64 md:h-80">
            <div className="w-16 md:w-56 bg-[hsl(283,35%,18%)] shrink-0 p-3">
              <div className="space-y-1.5">
                {['# general', '# engineering', '# random', '# design'].map((ch) => (
                  <div key={ch} className="text-xs md:text-sm text-white/60 px-2 py-1 rounded truncate">{ch}</div>
                ))}
              </div>
            </div>
            <div className="flex-1 p-4 space-y-3">
              {[
                { name: 'Sarah K.', msg: 'Just deployed the new API endpoint!' },
                { name: 'Mike R.', msg: 'Nice! The tests are all passing.' },
                { name: 'Lisa M.', msg: 'Can we review the PR before EOD?' },
              ].map((m) => (
                <div key={m.name} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-[var(--radius)] bg-muted shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-foreground">{m.name}</span>
                    <p className="text-sm text-muted-foreground">{m.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">Everything your team needs</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            From quick messages to complex workflows, TeamChat has the tools to keep your team moving.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-[var(--card-radius)] border border-border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-primary/10 text-primary">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Trusted worldwide
          </p>
          <p className="text-4xl font-bold text-foreground mb-6">750,000+ companies</p>
          <p className="text-muted-foreground max-w-lg mx-auto">
            From startups to Fortune 100, teams of every size rely on TeamChat to stay connected and productive.
          </p>
          <div className="mt-10 flex items-center justify-center gap-8 flex-wrap">
            {['Acme Corp', 'Globex', 'Initech', 'Hooli', 'Pied Piper'].map((co) => (
              <span key={co} className="text-lg font-semibold text-muted-foreground/50">{co}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 sm:grid-cols-4">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-foreground cursor-pointer transition-colors">Features</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Channels</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Integrations</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Security</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Solutions</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-foreground cursor-pointer transition-colors">Engineering</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Sales</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Marketing</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Support</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Resources</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-foreground cursor-pointer transition-colors">Blog</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Developers</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Community</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Events</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-foreground cursor-pointer transition-colors">About</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Careers</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Press</p>
                <Link href="/examples" className="hover:text-foreground transition-colors block">All Examples</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            Built with refraction-ui. Themed by CSS variables only.
          </div>
        </div>
      </footer>

      <ThemeDialog themeName="TeamChat (Slack)" themeConfig={slackTheme} />
    </div>
  )
}
