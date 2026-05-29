interface PropDefinition {
  name: string
  type: string
  default?: string
  description: string
}

interface PropsTableProps {
  props: PropDefinition[]
}

export function PropsTable({ props }: PropsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prop</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Default</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {props.map((prop) => (
            <tr key={prop.name} className="transition-colors hover:bg-muted/20">
              <td className="px-4 py-3 align-top">
                <code className="inline-block rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-mono font-medium text-primary whitespace-nowrap">
                  {prop.name}
                </code>
              </td>
              <td className="px-4 py-3 align-top">
                <code className="inline-block rounded-md bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-xs font-mono text-zinc-600 dark:text-zinc-300 break-words whitespace-pre-wrap">
                  {prop.type}
                </code>
              </td>
              <td className="px-4 py-3 align-top">
                {prop.default ? (
                  <code className="inline-block rounded-md bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-xs font-mono text-zinc-600 dark:text-zinc-300 break-words whitespace-pre-wrap">
                    {prop.default}
                  </code>
                ) : (
                  <span className="text-muted-foreground/30 text-xs">--</span>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground text-sm leading-relaxed align-top">{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
