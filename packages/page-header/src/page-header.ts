/** Heading element used for the page title. */
export type PageHeaderTitleLevel = 'h1' | 'h2' | 'h3'

export interface PageHeaderProps {
  /** Whether an actions slot will be rendered. */
  hasActions?: boolean
}

export interface PageHeaderAPI {
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic data attributes for a PageHeader — the heading
 * cluster at the top of an application page (kicker, title, description and a
 * trailing actions row). Unlike SectionHead (a centred marketing heading) it is
 * sized for dense app chrome and never centres.
 */
export function createPageHeader(props: PageHeaderProps = {}): PageHeaderAPI {
  return {
    dataAttributes: {
      'data-slot': 'page-header',
      'data-has-actions': props.hasActions ? 'true' : 'false',
    },
  }
}
