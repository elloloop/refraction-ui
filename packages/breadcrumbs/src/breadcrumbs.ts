export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbsProps {
  /** Current pathname to auto-generate from */
  pathname?: string
  /** Manual items (overrides pathname) */
  items?: BreadcrumbItem[]
  /** Custom label map for pathname segments */
  labels?: Record<string, string>
  /** Separator character */
  separator?: string
  /** Max items to show before truncating */
  maxItems?: number
}

export interface BreadcrumbsAPI {
  items: BreadcrumbItem[]
  ariaProps: Record<string, string>
  separator: string
  isLast: (index: number) => boolean
  itemAriaProps: (index: number) => Record<string, string>
}

function kebabToTitle(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function pathToItems(
  pathname: string,
  labels: Record<string, string> = {},
): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }]

  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    items.push({
      label: labels[segment] ?? labels[currentPath] ?? kebabToTitle(segment),
      href: currentPath,
    })
  }

  return items
}

export function createBreadcrumbs(props: BreadcrumbsProps = {}): BreadcrumbsAPI {
  const { pathname, items: manualItems, labels = {}, separator = '/', maxItems } = props

  let items = manualItems ?? (pathname ? pathToItems(pathname, labels) : [])

  if (maxItems && items.length > maxItems) {
    const first = items[0]
    const last = items.slice(-(maxItems - 1))
    items = [first, { label: '...' }, ...last]
  }

  return {
    items,
    ariaProps: { 'aria-label': 'Breadcrumb' },
    separator,
    isLast: (index: number) => index === items.length - 1,
    itemAriaProps: (index: number): Record<string, string> =>
      index === items.length - 1 ? { 'aria-current': 'page' } : {},
  }
}
