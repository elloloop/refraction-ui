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
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-foreground">Prop</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">Type</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">Default</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-primary">
                  {prop.name}
                </code>
              </td>
              <td className="px-4 py-3">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                  {prop.type}
                </code>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {prop.default ? (
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                    {prop.default}
                  </code>
                ) : (
                  <span className="text-muted-foreground/50">--</span>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
