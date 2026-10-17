import { LinkPreviewExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const linkPreviewProps = [
  {
    name: 'url',
    type: 'string',
    description:
      'Required. The page the card links to. Only absolute http(s) URLs render; anything else (`javascript:`, `data:`, `mailto:`, relative paths) renders nothing.',
  },
  {
    name: 'title',
    type: 'string',
    description: 'Page title. Falls back to the host when missing or blank.',
  },
  {
    name: 'siteName',
    type: 'string',
    description: 'Site name shown with the icon and in the link’s accessible name. Falls back to the host.',
  },
  {
    name: 'siteIcon',
    type: 'string',
    description: 'Favicon / site icon URL. Decorative (hidden from assistive tech); dropped if it fails to load.',
  },
  {
    name: 'description',
    type: 'string',
    description: 'Page description, clamped to 3 lines (full) or 1 line (compact). Exposed as the link’s description.',
  },
  {
    name: 'image',
    type: '{ src: string; width?: number; height?: number; alt?: string }',
    description:
      'Preview image, loaded lazily. `width`/`height` fix the box’s aspect ratio before it loads (clamped to 1 : 1 … 4 : 1; 1200 × 630 when unknown). `alt` defaults to `""`.',
  },
  {
    name: 'variant',
    type: "'full' | 'compact'",
    default: "'full'",
    description: 'Full: wide image above the text. Compact: square thumbnail beside one-line text.',
  },
  {
    name: 'target',
    type: 'HTMLAttributeAnchorTarget',
    default: "'_blank'",
    description: 'Link target. `rel` is always `noopener noreferrer nofollow`.',
  },
  {
    name: 'newTabLabel',
    type: 'string',
    default: "'opens in a new tab'",
    description: 'Appended to the link’s accessible name when `target` opens a new tab. Pass `""` for none.',
  },
  {
    name: 'onDismiss',
    type: '() => void',
    description: 'Shows a dismiss button over the card’s corner and is called when it is pressed.',
  },
  {
    name: 'dismissLabel',
    type: 'string',
    default: "'Remove preview'",
    description: 'Accessible name and tooltip of the dismiss button.',
  },
  {
    name: 'dismissIcon',
    type: 'React.ReactNode',
    default: '×',
    description: 'Glyph for the dismiss button.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional classes for the root. The root caps the width at `max-w-md`; override with `!max-w-*`.',
  },
  {
    name: '...props',
    type: 'HTMLAttributes<HTMLDivElement>',
    description:
      'Native attributes for the root `<div>` except `title` and `children`. `ref` is forwarded to the root.',
  },
]

const usageCode = `import { LinkPreview } from '@refraction-ui/react'

// \`unfurl\` is your server-side metadata fetch; LinkPreview never fetches.
export function MessageLinkPreview({ unfurl, onRemove }) {
  return (
    <LinkPreview
      url={unfurl.url}
      siteName={unfurl.siteName}
      siteIcon={unfurl.favicon}
      title={unfurl.title}
      description={unfurl.description}
      image={unfurl.image && {
        src: unfurl.image.url,
        width: unfurl.image.width,
        height: unfurl.image.height,
      }}
      variant="full"
      onDismiss={onRemove}
    />
  )
}`

export default function LinkPreviewPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Link Preview</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          An unfurled link card under a message: site icon and name, title, description and a
          lazily loaded image, in full and compact variants. You supply the metadata; the
          library never fetches anything.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Full</h2>
        <p className="text-sm text-muted-foreground">
          The whole card is one link. The image box takes its aspect ratio from{' '}
          <code className={code}>image.width</code> / <code className={code}>image.height</code>{' '}
          before the image loads, so a lazy image never shifts the conversation.
        </p>
        <LinkPreviewExamples section="full" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Compact</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>variant=&quot;compact&quot;</code> puts a square thumbnail beside a
          one-line title and description, for dense threads.
        </p>
        <LinkPreviewExamples section="compact" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Dismissible</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className={code}>onDismiss</code> to show a remove button over the card’s
          corner. It is a sibling of the link, never nested inside it, so it is a separate tab
          stop and pressing it cannot follow the link.
        </p>
        <LinkPreviewExamples section="dismissible" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Fallbacks and unsafe URLs</h2>
        <p className="text-sm text-muted-foreground">
          Missing fields degrade gracefully: no image renders a text-only card, and no title
          shows the host instead. A URL that is not absolute http(s) renders nothing at all (the
          third preview here uses <code className={code}>javascript:</code>): a preview exists
          to be that link, and a card that looks like a link but goes nowhere, carrying
          attacker-chosen text, is worse than none. The raw link is still in the message.
        </p>
        <LinkPreviewExamples section="fallbacks" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">In a message</h2>
        <p className="text-sm text-muted-foreground">
          Under a chat message. Dismissing unmounts the preview, so the example hands focus to
          the message’s own link.
        </p>
        <LinkPreviewExamples section="message" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Why not LinkCard?</h2>
        <p className="text-sm text-muted-foreground">
          LinkPreview is a new component rather than an extension of LinkCard. LinkCard is an
          unstyled <code className={code}>&lt;a&gt;</code> for documentation navigation that
          passes every anchor attribute through and supports{' '}
          <code className={code}>asChild</code> for router links. A preview has the opposite
          contract: the URL is untrusted user content, so the component owns{' '}
          <code className={code}>href</code> validation, <code className={code}>rel</code>, the
          accessible name, the image box and the dismiss button beside the link. Extending
          LinkCard would mean overriding all of that, and LinkCard has no styles or helpers to
          reuse.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            The card is one native link, named &quot;title, site&quot; (plus &quot;opens in a new
            tab&quot; when it does). The host and the description are linked with{' '}
            <code className={code}>aria-describedby</code>, so they are read once, after the name,
            rather than folded into it.
          </li>
          <li>
            The host is derived from the real URL, not the page’s metadata, and is always visible.
            Internationalised domains show in the URL parser’s ASCII (punycode) form, e.g.{' '}
            <code className={code}>xn--mnchen-3ya.de</code>, which resists look-alike spoofing.
          </li>
          <li>
            The site icon and the dot separator are hidden from assistive tech; the image has an
            empty <code className={code}>alt</code> by default because the name already says what
            the link is.
          </li>
          <li>
            The dismiss button is an <code className={code}>IconButton</code>: a separate tab stop
            after the link, named by <code className={code}>dismissLabel</code>, with a 44 × 44 px
            hit area. After dismissing, move focus somewhere sensible (the message, or the
            composer); the button disappears with the preview.
          </li>
          <li>
            A visible <code className={code}>focus-visible</code> ring; hover underlines the title
            as well as tinting the card, so the affordance is not colour alone. Transitions stop
            under <code className={code}>prefers-reduced-motion</code>, and text sizes are in rem.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={linkPreviewProps} />
      </section>
    </div>
  )
}
