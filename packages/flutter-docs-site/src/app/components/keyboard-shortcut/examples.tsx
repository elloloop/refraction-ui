'use client'
import { KeyboardShortcut, ShortcutBadge } from '@refraction-ui/react-keyboard-shortcut'
interface KeyboardShortcutExamplesProps { section: 'basic' }
export function KeyboardShortcutExamples({ section }: KeyboardShortcutExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-2.5">
            <ShortcutBadge keys={['Cmd', 'K']} />
            <span className="text-xs text-muted-foreground font-medium">Command Palette</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <ShortcutBadge keys={['Ctrl', 'S']} />
            <span className="text-xs text-muted-foreground font-medium">Save</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <ShortcutBadge keys={['Ctrl', 'Shift', 'P']} />
            <span className="text-xs text-muted-foreground font-medium">Command</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <ShortcutBadge keys={['Esc']} />
            <span className="text-xs text-muted-foreground font-medium">Close</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}
