import Link from 'next/link'

const examples = [
  {
    title: 'Communication Platform',
    subtitle: 'Slack-like',
    description:
      'A full messaging workspace with channels, direct messages, threaded replies, and a channel browser. Features real-time presence indicators and rich message formatting.',
    href: '/examples/slack',
    color: 'from-purple-600 to-pink-500',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    pages: ['Landing Page', 'Chat Interface', 'Channel Browser'],
  },
  {
    title: 'AI Chat Assistant',
    subtitle: 'ChatGPT-like',
    description:
      'An intelligent conversational interface with conversation history, code block rendering, model selection, and a settings dashboard with usage analytics.',
    href: '/examples/ai-chat',
    color: 'from-emerald-500 to-teal-600',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
    pages: ['Landing Page', 'Chat Interface', 'Settings'],
  },
  {
    title: 'Social Media',
    subtitle: 'Instagram-like',
    description:
      'A photo-sharing social platform with stories, a scrolling feed with interactions, user profiles with post grids, and a masonry-layout explore page.',
    href: '/examples/instagram',
    color: 'from-orange-500 to-rose-600',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
      </svg>
    ),
    pages: ['Landing Page', 'Feed', 'Profile', 'Explore'],
  },
]

export default function ExamplesIndexPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Example Websites</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Three complete multi-page applications built with refraction-ui components, themed entirely through CSS custom properties. Each demonstrates how a single component library adapts to radically different brands.
        </p>
      </div>

      <div className="grid gap-8">
        {examples.map((example) => (
          <Link
            key={example.href}
            href={example.href}
            className="group block rounded-[var(--card-radius)] border border-border bg-card overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg"
          >
            <div className="flex flex-col lg:flex-row">
              {/* Preview placeholder */}
              <div className={`lg:w-80 h-48 lg:h-auto bg-gradient-to-br ${example.color} flex items-center justify-center text-white/90 shrink-0`}>
                {example.icon}
              </div>

              <div className="flex-1 p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {example.title}
                  </h2>
                  <span className="rounded-[var(--badge-radius)] bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {example.subtitle}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {example.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {example.pages.map((page) => (
                    <span
                      key={page}
                      className="rounded-[var(--badge-radius)] border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {page}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
