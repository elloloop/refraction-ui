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
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-semibold text-foreground text-xs uppercase tracking-wider">Prop</th>
            <th className="px-4 py-3 text-left font-semibold text-foreground text-xs uppercase tracking-wider">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-foreground text-xs uppercase tracking-wider">Default</th>
            <th className="px-4 py-3 text-left font-semibold text-foreground text-xs uppercase tracking-wider">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {props.map((prop) => (
            <tr key={prop.name} className="transition-colors hover:bg-muted/30">
              <td className="px-4 py-3">
                <code className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-mono font-medium text-primary">
                  {prop.name}
                </code>
              </td>
              <td className="px-4 py-3">
                <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                  {prop.type}
                </code>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {prop.default ? (
                  <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-mono">
                    {prop.default}
                  </code>
                ) : (
                  <span className="text-muted-foreground/40">--</span>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground text-sm leading-relaxed">{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
