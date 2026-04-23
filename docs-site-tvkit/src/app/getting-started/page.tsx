import { CodeSample } from '@/components/code-sample'
import { FrameworkTabs } from '@/components/framework-tabs'

export const metadata = {
  title: 'Getting started — tvkit',
}

export default function GettingStartedPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
      <header className="space-y-3 not-prose">
        <h1 className="text-4xl font-bold tracking-tight">Getting started</h1>
        <p className="text-lg text-muted-foreground">
          A ten-minute walkthrough — from nothing installed to a running app
          on a Samsung Tizen emulator. The same flow works for every
          platform tvkit supports: substitute{' '}
          <code>webos</code> / <code>androidtv</code> / <code>firetv</code>{' '}
          wherever you see <code>tizen</code> below.
        </p>
      </header>

      <section className="space-y-3 not-prose">
        <h2 className="text-2xl font-semibold">Prerequisites</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Node.js 20</strong> or newer.
            Apps you create with <code>tvkit create</code> have no Node
            constraint beyond recent LTS.
          </li>
          <li>
            <strong className="text-foreground">pnpm 10.</strong>{' '}
            <code>corepack enable</code> is the easiest way to get the right
            version.
          </li>
          <li>
            <strong className="text-foreground">Platform SDKs</strong> install
            on demand via <code>tvkit doctor</code> and{' '}
            <code>tvkit emulator install</code>. No manual SDK setup is
            required up-front.
          </li>
        </ul>
      </section>

      <section className="space-y-3 not-prose">
        <h2 className="text-2xl font-semibold">1. Install the CLI</h2>
        <p className="text-muted-foreground">
          The CLI is published as <code>@tvkit/cli</code>. Until it lands on
          npm, install from the repo; once published, use the command below.
        </p>
        <CodeSample title="install">{`npm install -g @tvkit/cli

tvkit --version
tvkit --help`}</CodeSample>
      </section>

      <section className="space-y-3 not-prose">
        <h2 className="text-2xl font-semibold">2. Scaffold an app</h2>
        <p className="text-muted-foreground">
          <code>tvkit create</code> asks you to pick a template. Both
          templates ship with <code>@tvkit/core</code>, a D-pad button grid,
          and a platform banner wired to <code>detectPlatform()</code>.
        </p>

        <FrameworkTabs
          vanilla={`tvkit create myapp --template vanilla
cd myapp
pnpm install
pnpm dev`}
          react={`tvkit create myapp --template react
cd myapp
pnpm install
pnpm dev`}
        />
      </section>

      <section className="space-y-3 not-prose">
        <h2 className="text-2xl font-semibold">3. Check your toolchain</h2>
        <p className="text-muted-foreground">
          <code>doctor</code> verifies Node / pnpm versions, probes for every
          platform SDK, and offers a <code>--fix</code> flag that runs the
          install command when one is safe to automate.
        </p>
        <CodeSample>{`tvkit doctor
tvkit doctor --fix   # opt into autofix for failing checks`}</CodeSample>
        <p className="text-muted-foreground">
          It is safe to re-run <code>tvkit doctor</code> after each install;
          passing checks are never repeated.
        </p>
      </section>

      <section className="space-y-3 not-prose">
        <h2 className="text-2xl font-semibold">4. Install an emulator</h2>
        <p className="text-muted-foreground">
          Supported platforms today: <code>tizen</code>, <code>webos</code>,{' '}
          <code>androidtv</code>. Fire TV shares Android TV&apos;s emulator;
          VIDAA / SmartCast / Titan / Zeasn have no public emulator and must
          be tested on real hardware.
        </p>
        <CodeSample>{`tvkit emulator install tizen
tvkit emulator start tizen
tvkit emulator list     # show status across all platforms
tvkit emulator stop tizen`}</CodeSample>
      </section>

      <section className="space-y-3 not-prose">
        <h2 className="text-2xl font-semibold">5. Build, install, and launch</h2>
        <p className="text-muted-foreground">
          <code>tvkit run</code> chains four steps: build, install the
          artifact on a device or emulator, launch the app, and tail the
          platform&apos;s native logs. Live reload is on by default.
        </p>
        <CodeSample>{`tvkit run tizen
tvkit run tizen --device <id>       # pick a specific device
tvkit run tizen --release           # release build`}</CodeSample>
      </section>

      <section className="space-y-3 not-prose">
        <h2 className="text-2xl font-semibold">6. Ship</h2>
        <p className="text-muted-foreground">
          When you are ready, <code>tvkit build &lt;platform&gt;</code>{' '}
          produces a release artifact and <code>tvkit publish</code> either
          uploads it (Google Play, Amazon Appstore) or produces a partner
          submission bundle. See{' '}
          <a href="/publishing" className="text-primary hover:underline">
            Publishing
          </a>{' '}
          for the per-store flow.
        </p>
        <CodeSample>{`tvkit build tizen --release --signing-config ./signing.json
tvkit publish tizen`}</CodeSample>
      </section>

      <section className="space-y-3 not-prose">
        <h2 className="text-2xl font-semibold">Next</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            Read the{' '}
            <a href="/platforms" className="text-primary hover:underline">
              platform support matrix
            </a>{' '}
            to understand where the gaps are.
          </li>
          <li>
            Consult the{' '}
            <a href="/api/core" className="text-primary hover:underline">
              @tvkit/core API reference
            </a>{' '}
            for <code>createTvInput</code>, <code>createNavigation</code>,{' '}
            <code>promptText</code>, and <code>promptVoice</code>.
          </li>
          <li>
            See the{' '}
            <a href="/architecture" className="text-primary hover:underline">
              architecture ADR
            </a>{' '}
            for why the v1 scope stops at the web-capable eight.
          </li>
        </ul>
      </section>
    </article>
  )
}
