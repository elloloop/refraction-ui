import { Badge } from '@/components/refraction-client'
import { CodeSample } from '@/components/code-sample'

export const metadata = {
  title: 'Publishing — tvkit',
}

interface StoreSectionProps {
  id: string
  name: string
  tier: 'automatable' | 'semi-automatable' | 'partner-gated'
  portalUrl: string
  children: React.ReactNode
}

function StoreSection({ id, name, tier, portalUrl, children }: StoreSectionProps) {
  const tierVariant =
    tier === 'automatable'
      ? 'default'
      : tier === 'semi-automatable'
      ? 'secondary'
      : 'destructive'
  return (
    <section id={id} className="space-y-3 scroll-mt-20">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold">{name}</h2>
        <Badge variant={tierVariant}>{tier}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Portal:{' '}
        <a
          href={portalUrl}
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          {portalUrl}
        </a>
      </p>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export default function PublishingPage() {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Publishing</h1>
        <p className="text-lg text-muted-foreground">
          TV store publishing sits on a spectrum: some platforms expose a
          full upload API, some expose a login + upload flow but require
          manual certification, and the rest have no public developer
          program at all. tvkit treats all three cases through the same{' '}
          <code>tvkit publish</code> command and surfaces the difference
          via the <code>PublishResult.manualSteps</code> it returns.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Tiers at a glance</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
            <Badge>automatable</Badge>
            <p className="text-sm text-muted-foreground">
              Public developer API exists — the CLI uploads and (on some
              stores) submits for review end-to-end.
            </p>
            <p className="text-xs font-medium text-foreground">
              Google Play · Amazon Appstore
            </p>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
            <Badge variant="secondary">semi-automatable</Badge>
            <p className="text-sm text-muted-foreground">
              A developer program exists but certification + release
              require UI-only steps after upload.
            </p>
            <p className="text-xs font-medium text-foreground">
              Samsung Seller Office · LG Seller Lounge
            </p>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 space-y-2">
            <Badge variant="destructive">partner-gated</Badge>
            <p className="text-sm text-muted-foreground">
              No public developer program. tvkit produces a submission
              bundle; you upload via each partner&apos;s portal after
              onboarding.
            </p>
            <p className="text-xs font-medium text-foreground">
              VIDAA · SmartCast · Titan OS · Zeasn
            </p>
          </div>
        </div>
      </section>

      {/* Automatable */}
      <StoreSection
        id="google-play"
        name="Google Play (Android TV)"
        tier="automatable"
        portalUrl="https://play.google.com/console/"
      >
        <p className="text-muted-foreground">
          The Play Publishing API is consumed via <code>fastlane supply</code>
          , the community-standard wrapper around the same REST endpoints.
          tvkit shells out to <code>fastlane</code> so it adds no runtime
          dependency; install fastlane yourself (<code>brew install fastlane</code>
          on macOS, or <code>gem install fastlane</code>).
        </p>
        <h3 className="font-semibold">Credentials</h3>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>
            Create a service account in Google Cloud with Play Console
            access, download the JSON key.
          </li>
          <li>
            Set{' '}
            <code className="font-mono">
              TVKIT_GOOGLE_PLAY_SERVICE_ACCOUNT_JSON
            </code>{' '}
            to the absolute path of the key file.
          </li>
          <li>
            Optionally pass <code>googlePlay.applicationId</code> and{' '}
            <code>googlePlay.track</code> in your metadata JSON to override
            the defaults (<code>com.tvkit.&lt;name&gt;</code> /{' '}
            <code>production</code>).
          </li>
        </ul>
        <CodeSample language="bash">{`export TVKIT_GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=/path/to/play-service-account.json
tvkit build androidtv --release --signing-config ./keystore.jks
tvkit publish androidtv --metadata ./listing.json`}</CodeSample>
      </StoreSection>

      <StoreSection
        id="amazon-appstore"
        name="Amazon Appstore (Fire TV)"
        tier="automatable"
        portalUrl="https://developer.amazon.com/apps-and-games"
      >
        <p className="text-muted-foreground">
          Implements the three-call App Submission API flow: OAuth
          (<code>api.amazon.com/auth/o2/token</code>), APK upload
          (<code>edits/&lt;editId&gt;/apks/upload</code>), and{' '}
          <code>actions/submit-for-review</code>. Uses the native Node 20{' '}
          <code>fetch</code> — no runtime dependencies.
        </p>
        <h3 className="font-semibold">Credentials</h3>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>
            Create a security profile in the Amazon Developer Console and
            grant it App Submission scope.
          </li>
          <li>
            Set the three env vars:
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li>
                <code className="font-mono">TVKIT_AMAZON_CLIENT_ID</code>
              </li>
              <li>
                <code className="font-mono">TVKIT_AMAZON_CLIENT_SECRET</code>
              </li>
              <li>
                <code className="font-mono">TVKIT_AMAZON_APP_ID</code>
              </li>
            </ul>
          </li>
        </ul>
        <h3 className="font-semibold">Submission requirement</h3>
        <p className="text-sm text-muted-foreground">
          Amazon review rejects media apps that do not handle{' '}
          <code>MediaPlayPause</code> (keyCode 179). tvkit&apos;s keycode
          matrix normalizes this to the logical <code>MediaPlayPause</code>{' '}
          key — wire it before submitting.
        </p>
      </StoreSection>

      {/* Semi-automatable */}
      <StoreSection
        id="samsung-seller-office"
        name="Samsung Seller Office (Tizen)"
        tier="semi-automatable"
        portalUrl="https://seller.samsungapps.com"
      >
        <p className="text-muted-foreground">
          Seller Office exposes a REST login flow (email + password + OTP)
          and a <code>.wgt</code> upload endpoint, but region targeting,
          content-rating questionnaire, and final submission are UI-only.
          tvkit logs in, uploads the artifact, and returns the Seller
          Office URL plus <code>manualSteps</code>.
        </p>
        <h3 className="font-semibold">Credentials</h3>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>
            <code className="font-mono">TVKIT_SAMSUNG_SELLER_EMAIL</code>
          </li>
          <li>
            <code className="font-mono">TVKIT_SAMSUNG_SELLER_PASSWORD</code>
          </li>
          <li>
            <code className="font-mono">TVKIT_SAMSUNG_SELLER_OTP</code> —
            single-use per session. Generate from the authenticator app
            before running <code>tvkit publish</code>.
          </li>
        </ul>
        <h3 className="font-semibold">Manual steps after upload</h3>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>Open Seller Office, fill region targeting.</li>
          <li>Fill the content rating form.</li>
          <li>Submit for review.</li>
        </ul>
      </StoreSection>

      <StoreSection
        id="lg-seller-lounge"
        name="LG Seller Lounge (webOS)"
        tier="semi-automatable"
        portalUrl="https://seller.lgappstv.com/"
      >
        <p className="text-muted-foreground">
          Seller Lounge is largely a manual web portal with minimal
          scriptable endpoints. tvkit therefore produces a
          well-formed <code>lg-submission/</code> folder (the{' '}
          <code>.ipk</code>, screenshots, EN + KO descriptions, privacy
          policy reference) for upload via the portal.
        </p>
        <h3 className="font-semibold">Manual steps</h3>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>Sign in to the Seller Lounge.</li>
          <li>Create or update the app listing.</li>
          <li>
            Upload the <code>.ipk</code> from <code>lg-submission/</code>.
          </li>
          <li>
            Attach screenshots from <code>lg-submission/screenshots/</code>.
          </li>
          <li>
            Paste EN + KO descriptions from{' '}
            <code>lg-submission/descriptions/</code>.
          </li>
          <li>Provide a privacy policy URL.</li>
          <li>Submit for review.</li>
        </ul>
      </StoreSection>

      {/* Partner-gated */}
      <StoreSection
        id="vidaa"
        name="Hisense VIDAA"
        tier="partner-gated"
        portalUrl="https://hisensesmartapps.com/developer/"
      >
        <p className="text-muted-foreground">
          No public developer API. Partners submit apps through the Hisense
          Smart Apps portal after onboarding with a Hisense partner
          manager. tvkit writes a{' '}
          <code>submission-bundle-vidaa/</code> alongside your artifact and
          returns the portal URL in <code>manualSteps</code>.
        </p>
        <p className="text-sm text-muted-foreground">
          The VIDAA Web App Development Guide is distributed to partners
          under NDA — obtain it from the partner portal before certifying a
          release.
        </p>
      </StoreSection>

      <StoreSection
        id="smartcast"
        name="Vizio SmartCast"
        tier="partner-gated"
        portalUrl="https://developer.vizio.com/"
      >
        <p className="text-muted-foreground">
          Vizio&apos;s developer program is invitation-only. Contact a Vizio
          Account manager with the TV&apos;s serial number to enable
          on-device developer mode. tvkit produces a submission bundle; the
          partner library implementation (proprietary) ships separately.
        </p>
        <p className="text-sm text-muted-foreground">
          The public <code>developer.vizio.com</code> portal gives
          overview-only material. Per-model keycode tables and upload
          endpoints require partner access.
        </p>
      </StoreSection>

      <StoreSection
        id="titan"
        name="Titan OS (Xperi — Philips / JVC)"
        tier="partner-gated"
        portalUrl="https://developer.xperi.com/titan-os/"
      >
        <p className="text-muted-foreground">
          Titan OS onboarding is partner-gated. Contact{' '}
          <code>apponboarding@titanos.tv</code> for access; once approved,
          the public docs at <code>docs.titanos.tv</code> are the
          authoritative source for keycodes and submission format. tvkit
          writes a <code>submission-bundle-titan/</code> for portal upload.
        </p>
        <p className="text-sm text-muted-foreground">
          Back keycode varies by OEM: Philips devices emit <code>8</code>,
          JVC devices emit <code>461</code>. tvkit&apos;s Titan adapter
          accepts both.
        </p>
      </StoreSection>

      <StoreSection
        id="zeasn"
        name="Zeasn / Whale OS"
        tier="partner-gated"
        portalUrl="https://whale-tv.com/"
      >
        <p className="text-muted-foreground">
          Whale OS ships on Philips (outside Titan territories), TCL
          export SKUs, some Skyworth sets, and others. The public{' '}
          <code>developer.whaletv.com</code> portal gives overview material
          only; per-model keycode tables and certification flow are behind
          the partner portal (<code>partner.zeasn.com</code>).
        </p>
        <p className="text-sm text-muted-foreground">
          Whale explicitly instructs developers to key off its{' '}
          <code>VK_*</code> symbolic constants rather than numeric
          keyCodes, since physical keycodes vary by remote-control OEM.
          tvkit&apos;s Zeasn adapter does this when the Whale JS library is
          present and falls back to numeric keyCodes otherwise.
        </p>
      </StoreSection>
    </div>
  )
}
