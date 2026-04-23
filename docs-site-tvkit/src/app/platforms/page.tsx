import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/refraction-client'

export const metadata = {
  title: 'Platforms — tvkit',
}

type Tier = 'automatable' | 'semi-automatable' | 'partner-gated'

interface Platform {
  id: string
  name: string
  share: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  emulator: 'Landed' | 'Planned' | 'Not supported'
  packager: 'Landed' | 'Planned'
  publishingTier: Tier
  keyConfidence: string
  notes: string
}

const platforms: Platform[] = [
  {
    id: 'tizen',
    name: 'Samsung Tizen',
    share: '~21%',
    priority: 'P0',
    emulator: 'Landed',
    packager: 'Landed',
    publishingTier: 'semi-automatable',
    keyConfidence: 'Official',
    notes:
      'Mandatory keys + explicit per-session key registration via tizen.tvinputdevice.',
  },
  {
    id: 'webos',
    name: 'LG webOS',
    share: '~12%',
    priority: 'P0',
    emulator: 'Landed',
    packager: 'Landed',
    publishingTier: 'semi-automatable',
    keyConfidence: 'Official / Community',
    notes:
      'Magic Remote pointer events bypass the keycode matrix. No registration needed.',
  },
  {
    id: 'androidtv',
    name: 'Android TV / Google TV',
    share: '~15–20%',
    priority: 'P0',
    emulator: 'Landed',
    packager: 'Landed',
    publishingTier: 'automatable',
    keyConfidence: 'Official / Community',
    notes:
      'Back is the fragile key — needs popstate interception. Volume / Mute never reach JS.',
  },
  {
    id: 'firetv',
    name: 'Amazon Fire TV',
    share: '~5%',
    priority: 'P1',
    emulator: 'Planned',
    packager: 'Planned',
    publishingTier: 'automatable',
    keyConfidence: 'Official / Inferred',
    notes:
      'Amazon requires handling MediaPlayPause (179) for media apps. Shares Android TV emulator.',
  },
  {
    id: 'vidaa',
    name: 'Hisense VIDAA',
    share: '~4%',
    priority: 'P2',
    emulator: 'Not supported',
    packager: 'Planned',
    publishingTier: 'partner-gated',
    keyConfidence: 'Community',
    notes:
      'VIDAA Web App Development Guide is NDA-only. Back inconsistent (8 vs 461).',
  },
  {
    id: 'smartcast',
    name: 'Vizio SmartCast',
    share: '~2–3%',
    priority: 'P2',
    emulator: 'Not supported',
    packager: 'Planned',
    publishingTier: 'partner-gated',
    keyConfidence: 'Inferred',
    notes:
      'Dev access requires a Vizio Account manager contact. Partner library auto-binds keys.',
  },
  {
    id: 'titan',
    name: 'Titan OS (Philips / JVC)',
    share: '<2%',
    priority: 'P3',
    emulator: 'Not supported',
    packager: 'Planned',
    publishingTier: 'partner-gated',
    keyConfidence: 'Official / Inferred',
    notes:
      'Back keycode varies by OEM: Philips = 8, JVC = 461. Contact apponboarding@titanos.tv.',
  },
  {
    id: 'zeasn',
    name: 'Zeasn / Whale OS',
    share: '<2%',
    priority: 'P3',
    emulator: 'Not supported',
    packager: 'Planned',
    publishingTier: 'partner-gated',
    keyConfidence: 'Community',
    notes:
      'Whale docs instruct using VK_* constants over numeric keycodes. Remote varies by OEM.',
  },
]

function tierVariant(tier: Tier): 'default' | 'secondary' | 'destructive' {
  switch (tier) {
    case 'automatable':
      return 'default'
    case 'semi-automatable':
      return 'secondary'
    case 'partner-gated':
      return 'destructive'
  }
}

export default function PlatformsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Platforms</h1>
        <p className="text-lg text-muted-foreground">
          Living status for tvkit&apos;s eight web-capable smart TV
          platforms. Roku and tvOS are deferred; see{' '}
          <a href="/architecture" className="text-primary hover:underline">
            architecture
          </a>{' '}
          for the rationale.
        </p>
      </header>

      {/* Partner-gated callout */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-amber-500 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
          <div className="space-y-1 text-sm">
            <p className="font-medium text-foreground">
              Partner-gated platforms require a business relationship.
            </p>
            <p className="text-muted-foreground">
              VIDAA, Vizio SmartCast, Titan OS, and Zeasn / Whale have no
              public developer program. tvkit produces a submission bundle;
              final upload happens via each partner&apos;s portal after
              onboarding.
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Support matrix</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Platform</th>
                <th className="px-4 py-3 font-semibold">Share</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Emulator</th>
                <th className="px-4 py-3 font-semibold">Packager</th>
                <th className="px-4 py-3 font-semibold">Publishing</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.share}</td>
                  <td className="px-4 py-3">
                    <Badge>{p.priority}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.emulator}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.packager}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={tierVariant(p.publishingTier)}>
                      {p.publishingTier}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Per-platform cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Per-platform notes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {platforms.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge>{p.priority}</Badge>
                  <Badge variant="secondary">{p.share}</Badge>
                  <Badge variant="outline">{p.keyConfidence}</Badge>
                </div>
                <CardTitle>{p.name}</CardTitle>
                <CardDescription>{p.notes}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <div>
                  <span className="font-medium text-foreground">Emulator:</span>{' '}
                  {p.emulator}
                </div>
                <div>
                  <span className="font-medium text-foreground">Packager:</span>{' '}
                  {p.packager}
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    Publishing tier:
                  </span>{' '}
                  {p.publishingTier}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Status legend</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Landed</strong> — driver /
            packager / publisher is implemented and merged.
          </li>
          <li>
            <strong className="text-foreground">Planned</strong> — tracked by
            a GitHub issue; not yet started or in flight.
          </li>
          <li>
            <strong className="text-foreground">Not supported</strong> — no
            public SDK emulator exists; testing happens on real hardware.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Publishing tiers</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Automatable</strong> — Google
            Play (Android TV), Amazon Appstore (Fire TV). Both expose upload
            APIs that <code>tvkit publish</code> drives directly.
          </li>
          <li>
            <strong className="text-foreground">Semi-automatable</strong> —
            Samsung Seller Office, LG Seller Lounge. The CLI uploads the
            build; certification and release require manual steps in the
            partner portal.
          </li>
          <li>
            <strong className="text-foreground">Partner-gated</strong> —
            VIDAA, Vizio SmartCast, Titan OS, Zeasn. No public developer
            program; <code>tvkit publish</code> produces a submission bundle
            for partner-channel upload.
          </li>
        </ul>
      </section>
    </div>
  )
}
