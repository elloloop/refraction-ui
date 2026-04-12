import * as React from 'react'
import { cn } from '@refraction-ui/shared'
import { parseHeadings, observeHeadings, TocItem } from '@refraction-ui/table-of-contents'

export interface TableOfContentsProps extends React.HTMLAttributes<HTMLDivElement> {
  containerRef?: React.RefObject<HTMLElement | null>
  selectors?: string
  onActiveIdChange?: (id: string) => void
}

export const TableOfContents = React.forwardRef<HTMLDivElement, TableOfContentsProps>(
  ({ className, containerRef, selectors = 'h2, h3, h4', onActiveIdChange, ...props }, ref) => {
    const [headings, setHeadings] = React.useState<TocItem[]>([])
    const [activeId, setActiveId] = React.useState<string>('')

    React.useEffect(() => {
      const container = containerRef?.current || document.body
      if (!container) return

      const parsedHeadings = parseHeadings(container, selectors)
      setHeadings(parsedHeadings)

      if (parsedHeadings.length === 0) return

      const disconnect = observeHeadings(parsedHeadings.map(h => h.id), (id) => {
        setActiveId(id)
        onActiveIdChange?.(id)
      })

      return () => disconnect()
    }, [containerRef, selectors, onActiveIdChange])

    if (headings.length === 0) {
      return null
    }

    return (
      <nav ref={ref} className={cn("space-y-1", className)} {...props}>
        <ul className="m-0 list-none p-0">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={cn(
                "py-1",
                heading.level === 3 ? "pl-4" : heading.level === 4 ? "pl-8" : ""
              )}
            >
              <a
                href={`#${heading.id}`}
                className={cn(
                  "block text-sm transition-colors hover:text-foreground",
                  activeId === heading.id ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    )
  }
)
TableOfContents.displayName = 'TableOfContents'
