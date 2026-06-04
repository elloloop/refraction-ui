import Link from 'next/link'

const examples = [
  {
    title: 'Pregnancy Tracker',
    subtitle: 'Health & Wellness',
    description:
      'A full stateful demonstration of medical health tracking built entirely in Flutter using the Refraction architecture.',
    href: '/examples/pregnancy-tracker',
    color: 'from-pink-600 to-rose-500',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    ),
    pages: ['Dashboard', 'Timeline', 'Settings'],
  },
  {
    title: 'Family Calendar',
    subtitle: 'Productivity',
    description:
      'A rich data-dense grid structure for productivity displays. Showcases complex layout behavior on mobile and tablet form factors.',
    href: '/examples/family-calendar',
    color: 'from-blue-600 to-indigo-500',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
    pages: ['Month View', 'Week View', 'Day View'],
  }
]

export default function ExamplesIndexPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Example Flutter Apps</h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Fully interactive Flutter applications built entirely with refraction-ui components.
          Each demonstrates complex cross-platform layouts for mobile and tablet form factors.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {examples.map((example) => (
          <Link
            key={example.href}
            href={example.href}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
          >
            {/* Gradient header */}
            <div className={`h-32 bg-gradient-to-br ${example.color} flex items-center justify-center text-white/90 relative`}>
              {example.icon}
              {/* Page count badge */}
              <span className="absolute top-3 right-3 rounded-full bg-black/20 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-medium text-white/90">
                {example.pages.length} pages
              </span>
            </div>

            <div className="flex flex-col flex-1 p-5">
              <div className="flex items-center gap-2.5 mb-1">
                <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {example.title}
                </h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {example.subtitle}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                {example.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {example.pages.map((page) => (
                  <span
                    key={page}
                    className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {page}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Live Demo
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
