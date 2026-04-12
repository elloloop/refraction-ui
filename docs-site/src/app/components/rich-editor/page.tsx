import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const usageCode = `import { } from '@refraction-ui/react-rich-editor'

// Rich Editor is in early development.
// Core package structure is defined but exports are not yet available.`

export default function RichEditorPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
          <span className="inline-flex items-center rounded-md bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600">Coming Soon</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Rich Editor</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A rich text editor with formatting toolbar, markdown shortcuts, and extensible plugin system.
          The core package is defined but exports are not yet available.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Status</h2>
        <p className="text-sm text-muted-foreground">
          This component is in early development. The headless core and React wrapper packages are structured
          but the implementation is not yet complete.
        </p>
      </section>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Package</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->', vue: '<!-- Vue implementation pending -->' }} />
      </section>
    </div>
  )
}
