'use client'
import { AnimatedText, TypewriterText } from '@refraction-ui/react-animated-text'
interface AnimatedTextExamplesProps { section: 'basic' }
export function AnimatedTextExamples({ section }: AnimatedTextExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Word Carousel</span>
            <AnimatedText words={['innovative', 'beautiful', 'accessible', 'fast']} className="text-2xl font-bold" />
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Typewriter</span>
            <TypewriterText text="Hello, welcome to Refraction UI!" className="text-lg" />
          </div>
        </div>
      </div>
    )
  }
  return null
}
