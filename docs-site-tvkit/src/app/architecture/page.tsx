import { Badge } from '@/components/refraction-client'

export const metadata = {
  title: 'Architecture — tvkit',
}

export default function ArchitecturePage() {
  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge>ADR 0001</Badge>
          <Badge variant="secondary">Accepted</Badge>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Web-first runtime; Roku and tvOS deferred
        </h1>
        <p className="text-sm text-muted-foreground">Accepted 2026-04-23</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Context</h2>
        <p className="text-muted-foreground">
          tvkit is a &ldquo;write once, ship to every smart TV&rdquo;
          library. The 2024–2025 global smart TV OS landscape breaks down
          roughly like this:
        </p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Platform</th>
                <th className="px-4 py-3 font-semibold">Share</th>
                <th className="px-4 py-3 font-semibold">Runs web natively?</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-4 py-3">Samsung Tizen</td>
                <td className="px-4 py-3 text-muted-foreground">~21%</td>
                <td className="px-4 py-3">
                  <Badge>Yes</Badge>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3">Android TV / Google TV</td>
                <td className="px-4 py-3 text-muted-foreground">~15–20%</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">Via Chromium WebView shell</Badge>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3">LG webOS</td>
                <td className="px-4 py-3 text-muted-foreground">~12%</td>
                <td className="px-4 py-3">
                  <Badge>Yes</Badge>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3">Amazon Fire TV</td>
                <td className="px-4 py-3 text-muted-foreground">~5%</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">Via Amazon WebView shell</Badge>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3">Hisense VIDAA</td>
                <td className="px-4 py-3 text-muted-foreground">~4%</td>
                <td className="px-4 py-3">
                  <Badge>Yes</Badge>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3">Vizio SmartCast</td>
                <td className="px-4 py-3 text-muted-foreground">~2–3%</td>
                <td className="px-4 py-3">
                  <Badge>Yes</Badge>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3">Apple tvOS</td>
                <td className="px-4 py-3 text-muted-foreground">~1–2%</td>
                <td className="px-4 py-3">
                  <Badge variant="destructive">No full-app WebView</Badge>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3">Roku</td>
                <td className="px-4 py-3 text-muted-foreground">
                  ~5% global, ~30% US
                </td>
                <td className="px-4 py-3">
                  <Badge variant="destructive">No (BrightScript)</Badge>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3">Titan OS</td>
                <td className="px-4 py-3 text-muted-foreground">&lt;2%</td>
                <td className="px-4 py-3">
                  <Badge>Yes</Badge>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3">Zeasn / Whale OS</td>
                <td className="px-4 py-3 text-muted-foreground">&lt;2%</td>
                <td className="px-4 py-3">
                  <Badge>Yes</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground">
          Eight of these ten run web content natively (or via a thin WebView
          shell). Together they cover{' '}
          <strong className="text-foreground">
            ~85–90% of the global TV market
          </strong>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Decision</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Authoring:</strong> HTML / CSS
            / JS. Any framework — React, Vue, Svelte, vanilla — your choice.
          </li>
          <li>
            <strong className="text-foreground">Runtime:</strong> the browser
            / WebView shipped with each TV.
          </li>
          <li>
            <strong className="text-foreground">tvkit:</strong> a small JS
            library (remote input normalization, back button, on-screen
            keyboard, platform detection) + a CLI that packages a web bundle
            per platform and handles emulator install / dev loop / store
            publish.
          </li>
          <li>
            <strong className="text-foreground">Supported platforms:</strong>{' '}
            Samsung Tizen, LG webOS, Android TV, Amazon Fire TV, Hisense
            VIDAA, Vizio SmartCast, Titan OS, Zeasn / Whale OS.
          </li>
          <li>
            <strong className="text-foreground">Deferred:</strong> Apple tvOS
            and Roku. Both require separate non-web toolchains (TVML/TVJS
            and BrightScript respectively). Revisit once the web-first loop
            ships end-to-end.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Consequences</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
            <h3 className="font-semibold text-foreground">Positive</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Single codebase for ~85–90% of the global TV install base.</li>
              <li>
                Authoring stack is the world&apos;s most documented one
                (web).
              </li>
              <li>
                No custom renderer, no custom language, no custom VM — tvkit
                stays small.
              </li>
              <li>
                Developers keep the framework ecosystem they already know.
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
            <h3 className="font-semibold text-foreground">Negative</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>
                Performance ceiling is bound by each TV&apos;s WebView. Older
                Tizen / webOS versions can be sluggish.
              </li>
              <li>
                Roku and tvOS users are not reached until we invest in
                non-web runtimes.
              </li>
              <li>
                Android TV and Fire TV need a native wrapper in the repo —
                not pure web, but thin and mostly shared.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">
          Publishing reality (documented here to set expectations)
        </h2>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>
            <strong className="text-foreground">Fully automatable:</strong>{' '}
            Google Play (Android TV), Amazon Appstore (Fire TV).
          </li>
          <li>
            <strong className="text-foreground">Semi-automatable:</strong>{' '}
            Samsung Tizen Seller Office, LG Seller Lounge.
          </li>
          <li>
            <strong className="text-foreground">Partner-gated</strong> (no
            public developer program): VIDAA, Vizio, Titan, Zeasn. tvkit
            generates submission-ready bundles; final upload happens
            manually via partner portals.
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          See the full{' '}
          <a href="/publishing" className="text-primary hover:underline">
            Publishing reference
          </a>{' '}
          for portal URLs, required environment variables, and per-store
          setup.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Alternatives considered</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Flutter-based runtime</strong>{' '}
            — great for Android TV / Fire TV / tvOS, but Tizen and webOS
            embedders are community / experimental and Roku is unsupported.
            Would not achieve the breadth this ADR targets.
          </li>
          <li>
            <strong className="text-foreground">
              Custom runtime (à la Flutter&apos;s Skia + Dart)
            </strong>{' '}
            — years of engineering. Out of scope for v1.
          </li>
        </ul>
      </section>
    </article>
  )
}
