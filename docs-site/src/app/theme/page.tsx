import Link from 'next/link'
import { ThemePlayground } from './playground'

export default function ThemePage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Theme Playground</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Customize the Refraction UI theme by editing CSS variables in real time.
          Preview components with your changes, then export the CSS.
        </p>
      </div>

      {/* Navigation cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/theme/editor"
          className="group rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
              Config Editor
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Paste AI-generated CSS custom properties and instantly see your brand applied to every component in a live preview.
          </p>
        </Link>

        <Link
          href="/theme/generate"
          className="group rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
              Generate Theme
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Get a ready-to-copy prompt for ChatGPT or Claude that generates a complete CSS theme matching your brand description.
          </p>
        </Link>
      </div>

      <ThemePlayground />
    </div>
  )
}
