import { FlutterPreview } from '@/components/flutter-preview'
import Link from 'next/link'

export default function FamilyCalendarPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/examples" 
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back to Examples
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Family Calendar</h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            A rich data-dense grid structure for productivity displays built entirely in Flutter using the Refraction UI architecture. Showcases complex layout behavior on mobile and tablet form factors.
          </p>
        </div>
      </div>

      <div className="bg-muted/30 p-4 md:p-8 rounded-2xl border border-border flex justify-center">
        {/* Tablet device frame constraint */}
        <div className="w-full max-w-[768px] shadow-2xl rounded-xl overflow-hidden ring-1 ring-border/50">
          <FlutterPreview path="/docs/family-calendar" height={800} />
        </div>
      </div>
    </div>
  )
}
