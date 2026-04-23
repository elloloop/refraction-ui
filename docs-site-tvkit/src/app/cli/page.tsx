import { Badge } from '@/components/refraction-client'
import { CodeSample } from '@/components/code-sample'

export const metadata = {
  title: 'CLI reference — tvkit',
}

interface CommandProps {
  name: string
  tagline: string
  children: React.ReactNode
}

function Command({ name, tagline, children }: CommandProps) {
  return (
    <section id={name} className="space-y-3 scroll-mt-20">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-2xl font-semibold">
          <code className="font-mono">tvkit {name}</code>
        </h2>
        <Badge variant="secondary">{tagline}</Badge>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export default function CliPage() {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">CLI reference</h1>
        <p className="text-lg text-muted-foreground">
          Every <code>tvkit</code> command, its flags, examples, and exit
          codes. All commands return <code>0</code> on success and a non-zero
          integer on failure; unrecognized input returns <code>1</code>.
        </p>
        <nav className="flex flex-wrap gap-2 pt-2">
          {[
            'create',
            'doctor',
            'devices',
            'emulator',
            'build',
            'run',
            'logs',
            'publish',
          ].map((c) => (
            <a
              key={c}
              href={`#${c}`}
              className="rounded-md border border-border px-2.5 py-1 text-xs font-mono hover:bg-muted transition-colors"
            >
              {c}
            </a>
          ))}
        </nav>
      </header>

      <Command name="create" tagline="scaffold">
        <p className="text-muted-foreground">
          Scaffold a new tvkit app from a built-in template. Validates the
          app name (npm-safe, lowercase, no leading dot / underscore), then
          copies the template into <code>./&lt;name&gt;</code>.
        </p>
        <h3 className="font-semibold">Flags</h3>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>
            <code>--template</code>, <code>-t</code> — Template name.{' '}
            <code>vanilla</code> (TypeScript + Vite, default) or{' '}
            <code>react</code> (React 18 + Vite). New templates must be
            listed in the CLI&apos;s <code>SUPPORTED_TEMPLATES</code>.
          </li>
        </ul>
        <h3 className="font-semibold">Example</h3>
        <CodeSample>{`tvkit create myapp
tvkit create myapp --template react
tvkit create myapp -t vanilla`}</CodeSample>
        <h3 className="font-semibold">Exit codes</h3>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>
            <code>0</code> — app scaffolded.
          </li>
          <li>
            <code>1</code> — invalid name, unknown template, or destination
            already exists.
          </li>
        </ul>
      </Command>

      <Command name="doctor" tagline="env health">
        <p className="text-muted-foreground">
          Probe the host for Node, pnpm, and each platform SDK (Tizen
          Studio, webOS TV SDK, Android SDK, Fire TV tools). Prints a table
          with <code>ok</code> / <code>warn</code> / <code>error</code>{' '}
          status and a fix hint per row.
        </p>
        <h3 className="font-semibold">Flags</h3>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>
            <code>--fix</code> — Attempt to auto-install missing tools. Only
            runs commands the doctor has explicitly tagged as safe.
          </li>
        </ul>
        <h3 className="font-semibold">Example</h3>
        <CodeSample>{`tvkit doctor
tvkit doctor --fix`}</CodeSample>
        <h3 className="font-semibold">Exit codes</h3>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>
            <code>0</code> — all checks ok (or warnings only).
          </li>
          <li>
            <code>1</code> — one or more checks returned <code>error</code>{' '}
            (e.g. unsupported Node version).
          </li>
        </ul>
      </Command>

      <Command name="devices" tagline="discover">
        <p className="text-muted-foreground">
          List connected TV devices and running emulators. Queries
          Tizen&apos;s <code>sdb</code>, webOS&apos;s{' '}
          <code>ares-setup-device</code>, and Android&apos;s <code>adb</code>;
          rows missing a tool are silently skipped.
        </p>
        <h3 className="font-semibold">Flags</h3>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>
            <code>--json</code> — Emit JSON instead of the formatted table.
          </li>
          <li>
            <code>--verbose</code> — Include offline / unauthorized devices.
          </li>
        </ul>
        <h3 className="font-semibold">Example</h3>
        <CodeSample>{`tvkit devices
tvkit devices --json`}</CodeSample>
      </Command>

      <Command name="emulator" tagline="manage emulators">
        <p className="text-muted-foreground">
          Install, start, stop, list, and remove each platform&apos;s
          official emulator. The install is cached under your user config
          directory — subsequent runs are fast.
        </p>
        <h3 className="font-semibold">Subcommands</h3>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>
            <code>emulator list</code> — Table of every plugin-contributed
            emulator with its <code>installed</code> / <code>running</code>{' '}
            status.
          </li>
          <li>
            <code>emulator install &lt;platform&gt;</code> — Download and set
            up the emulator for <code>tizen</code>, <code>webos</code>,{' '}
            <code>androidtv</code>, <code>firetv</code>.
          </li>
          <li>
            <code>emulator start &lt;platform&gt;</code> — Launch the
            emulator.
          </li>
          <li>
            <code>emulator stop &lt;platform&gt;</code> — Stop a running
            emulator.
          </li>
          <li>
            <code>emulator remove &lt;platform&gt;</code> — Uninstall the
            emulator bundle.
          </li>
        </ul>
        <h3 className="font-semibold">Flags</h3>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>
            <code>--version &lt;v&gt;</code> — Pin a specific emulator
            version (supported by <code>install</code> and <code>start</code>).
          </li>
        </ul>
        <h3 className="font-semibold">Example</h3>
        <CodeSample>{`tvkit emulator install tizen
tvkit emulator start tizen
tvkit emulator list
tvkit emulator stop tizen`}</CodeSample>
      </Command>

      <Command name="build" tagline="package">
        <p className="text-muted-foreground">
          Produce a platform-specific installable (<code>.wgt</code>,{' '}
          <code>.ipk</code>, APK, or partner bundle) from the current
          project. Each platform&apos;s packager lives in its{' '}
          <code>@tvkit/platform-*</code> package.
        </p>
        <h3 className="font-semibold">Usage</h3>
        <CodeSample>{`tvkit build <platform> [flags]`}</CodeSample>
        <h3 className="font-semibold">Known platforms</h3>
        <p className="text-sm text-muted-foreground">
          <code>androidtv</code>, <code>firetv</code>, <code>smartcast</code>,{' '}
          <code>titan</code>, <code>tizen</code>, <code>vidaa</code>,{' '}
          <code>webos</code>, <code>zeasn</code>.
        </p>
        <h3 className="font-semibold">Flags</h3>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>
            <code>--release</code> — Signed release build.
          </li>
          <li>
            <code>--debug</code> — Debug build (default).
          </li>
          <li>
            <code>--output &lt;dir&gt;</code> — Output directory (default{' '}
            <code>./dist/tvkit/&lt;platform&gt;</code>).
          </li>
          <li>
            <code>--signing-config &lt;path&gt;</code> — Platform signing
            config: Tizen <code>.p12</code> / profile name, Android/Fire TV
            keystore.
          </li>
        </ul>
        <h3 className="font-semibold">Example</h3>
        <CodeSample>{`tvkit build tizen
tvkit build tizen --release --signing-config ./signing.p12
tvkit build androidtv --release --output ./out/apk`}</CodeSample>
      </Command>

      <Command name="run" tagline="build + install + launch + logs">
        <p className="text-muted-foreground">
          Chain <code>build</code>, sideload the artifact onto a device or
          emulator, launch the app, and tail the platform&apos;s native
          logs. Live reload is enabled by default on the Vite dev server.
        </p>
        <h3 className="font-semibold">Flags</h3>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>
            <code>--device &lt;id&gt;</code> — Target a specific device /
            emulator by id (from <code>tvkit devices</code>).
          </li>
          <li>
            <code>--platform &lt;name&gt;</code> — Restrict device selection
            to one platform (e.g. <code>tizen</code>).
          </li>
          <li>
            <code>--port &lt;n&gt;</code> — Dev server port (default{' '}
            <code>5173</code>, Vite&apos;s default).
          </li>
          <li>
            <code>--release</code> — Launch a release build instead of
            debug.
          </li>
        </ul>
        <h3 className="font-semibold">Example</h3>
        <CodeSample>{`tvkit run tizen
tvkit run tizen --device emulator-26101
tvkit run webos --port 5175`}</CodeSample>
      </Command>

      <Command name="logs" tagline="tail device logs">
        <p className="text-muted-foreground">
          Stream logs from a connected device or emulator. Supports{' '}
          <code>tizen</code>, <code>webos</code>, <code>androidtv</code>,{' '}
          <code>firetv</code>. Partner-gated platforms have no standard log
          tool; the command exits cleanly with a message on those.
        </p>
        <h3 className="font-semibold">Flags</h3>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>
            <code>--device &lt;id&gt;</code> — Specific device / emulator.
          </li>
          <li>
            <code>--filter &lt;regex&gt;</code> — Only print lines matching a
            pattern.
          </li>
        </ul>
        <h3 className="font-semibold">Example</h3>
        <CodeSample>{`tvkit logs androidtv
tvkit logs tizen --filter 'tvkit|console'`}</CodeSample>
      </Command>

      <Command name="publish" tagline="ship">
        <p className="text-muted-foreground">
          Upload a built artifact to the platform&apos;s store or — for
          partner-gated platforms — produce a submission bundle the user
          ships manually. See{' '}
          <a href="/publishing" className="text-primary hover:underline">
            Publishing
          </a>{' '}
          for per-platform credentials and portal URLs.
        </p>
        <h3 className="font-semibold">Flags</h3>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>
            <code>--artifact &lt;path&gt;</code> — Path to the built
            artifact. Defaults to the last <code>tvkit build</code> output.
          </li>
          <li>
            <code>--release</code> — Submit to production (default{' '}
            <code>true</code>). <code>--release=false</code> targets the
            beta / staging channel on stores that have one.
          </li>
          <li>
            <code>--metadata &lt;path&gt;</code> — JSON file with listing
            fields (<code>name</code>, <code>version</code>,{' '}
            <code>description</code>, <code>iconPath</code>,{' '}
            <code>screenshots</code>). Defaults to <code>./package.json</code>.
          </li>
        </ul>
        <h3 className="font-semibold">Example</h3>
        <CodeSample>{`tvkit publish androidtv
tvkit publish tizen --artifact ./dist/tvkit/tizen/myapp.wgt
tvkit publish vidaa --metadata ./listing.json`}</CodeSample>
      </Command>
    </div>
  )
}
