'use client'

import { useFramework, Framework } from './framework-context'

const frameworks: { id: Framework; label: string; status?: string }[] = [
  { id: 'react', label: 'React' },
  { id: 'astro', label: 'Astro' },
  { id: 'angular', label: 'Angular', status: 'WIP' },
  { id: 'vue', label: 'Vue', status: 'WIP' },
]

export function FrameworkTabs() {
  const { framework, setFramework } = useFramework()

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-border pb-4">
      {frameworks.map((fw) => (
        <button
          key={fw.id}
          onClick={() => setFramework(fw.id)}
          className={`relative px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            framework === fw.id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {fw.label}
          {fw.status && (
            <span className="ml-1.5 inline-flex items-center rounded-sm bg-foreground/10 px-1 py-0.5 text-[10px] font-bold uppercase text-foreground/50">
              {fw.status}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
