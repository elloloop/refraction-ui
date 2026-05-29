import Link from 'next/link'

const examples = [
  {
    title: 'Teamspace',
    subtitle: 'Communication Platform',
    description:
      'Full messaging workspace with channels, direct messages, threaded replies, and a channel browser.',
    href: '/examples/teamspace',
    color: 'from-blue-600 to-indigo-500',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    pages: ['Landing Page', 'Chat Interface', 'Channel Browser'],
  },
  {
    title: 'Cortex',
    subtitle: 'AI Chat Assistant',
    description:
      'Intelligent conversational interface with conversation history, code block rendering, and model selection.',
    href: '/examples/cortex',
    color: 'from-amber-500 to-orange-600',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
      </svg>
    ),
    pages: ['Landing Page', 'Chat Interface', 'Settings'],
  },
  {
    title: 'Momento',
    subtitle: 'Social Media',
    description:
      'Photo-sharing social platform with stories, scrolling feed, user profiles, and masonry explore page.',
    href: '/examples/momento',
    color: 'from-orange-400 to-rose-500',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
      </svg>
    ),
    pages: ['Landing Page', 'Feed', 'Profile', 'Explore'],
  },
  {
    title: 'The Grandview',
    subtitle: 'Hotel & Hospitality',
    description:
      'Elegant hotel website with room listings, booking flow, guest reviews, and luxury design tokens.',
    href: '/examples/grandview',
    color: 'from-amber-700 to-yellow-600',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
      </svg>
    ),
    pages: ['Landing Page', 'Room Browser', 'Booking Flow'],
  },
  {
    title: 'Maison Eclat',
    subtitle: 'Luxury Brand',
    description:
      'High-end luxury brand showcase with refined typography, elegant product cards, and brand story.',
    href: '/examples/maison',
    color: 'from-stone-700 to-stone-500',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      </svg>
    ),
    pages: ['Landing Page', 'Collection', 'Product Detail'],
  },
  {
    title: 'Ember & Oak',
    subtitle: 'Restaurant',
    description:
      'Fine-dining restaurant site with menu highlights, reservation flow, chef story, and warm design tokens.',
    href: '/examples/ember',
    color: 'from-red-700 to-orange-600',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
      </svg>
    ),
    pages: ['Landing Page', 'Full Menu', 'Reservation'],
  },
  {
    title: 'Verve',
    subtitle: 'E-Commerce',
    description:
      'Modern fashion e-commerce storefront with product grids, product page, and shopping cart.',
    href: '/examples/verve',
    color: 'from-neutral-800 to-neutral-600',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
    pages: ['Landing Page', 'Product Page', 'Shopping Cart'],
  },
  {
    title: 'InsightIQ',
    subtitle: 'SaaS Analytics',
    description:
      'SaaS analytics platform with real-time dashboards, pricing tiers, FAQ accordion, and settings.',
    href: '/examples/insightiq',
    color: 'from-violet-600 to-purple-500',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
      </svg>
    ),
    pages: ['Landing Page', 'Dashboard', 'Settings'],
  },
  {
    title: 'VitaLink',
    subtitle: 'Healthcare',
    description:
      'Healthcare portal with doctor profiles, appointment booking, and trust-building design tokens.',
    href: '/examples/vitalink',
    color: 'from-teal-600 to-cyan-500',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    ),
    pages: ['Landing Page', 'Patient Portal', 'Appointments'],
  },
  {
    title: 'LearnHub',
    subtitle: 'Education',
    description:
      'Online learning platform with course listings, category filters, and enrollment flows.',
    href: '/examples/learnhub',
    color: 'from-emerald-600 to-green-500',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
    pages: ['Landing Page', 'Course Catalog', 'Course Detail'],
  },
  {
    title: 'ClearBank',
    subtitle: 'Finance',
    description:
      'Modern neobank with account dashboard, transfer flows, and trustworthy design tokens.',
    href: '/examples/clearbank',
    color: 'from-sky-600 to-blue-500',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
      </svg>
    ),
    pages: ['Landing Page', 'Dashboard', 'Transfer'],
  },
  {
    title: 'Studio X',
    subtitle: 'Portfolio',
    description:
      'Creative agency portfolio with project showcases, service listings, and bold design tokens.',
    href: '/examples/studiox',
    color: 'from-zinc-800 to-zinc-600',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
      </svg>
    ),
    pages: ['Landing Page', 'All Work', 'Project Detail'],
  },
]

export default function ExamplesIndexPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Example Websites</h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Twelve complete multi-page applications built entirely with refraction-ui components.
          Each demonstrates how one component library adapts to radically different brands.
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
