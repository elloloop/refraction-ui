'use client'
import { InstallPrompt } from '@refraction-ui/react-install-prompt'
interface InstallPromptExamplesProps { section: 'basic' }
export function InstallPromptExamples({ section }: InstallPromptExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-md">
          <InstallPrompt
            appName="My App"
            description="Install this app for the best experience."
            onInstall={() => alert('Install triggered')}
            onDismiss={() => alert('Dismissed')}
          />
        </div>
      </div>
    )
  }
  return null
}
