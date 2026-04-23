import { CodeSample } from '@/components/code-sample'

export const metadata = {
  title: 'API — Platform plugins',
}

export default function ApiPlatformsPage() {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">
          API — Platform plugins
        </h1>
        <p className="text-lg text-muted-foreground">
          A platform plugin is a small manifest that contributes a packager,
          an optional launcher, an optional emulator driver, and a
          publisher to the CLI. The CLI itself never implements per-platform
          logic; every TV OS lives in its own{' '}
          <code>@tvkit/platform-*</code> package.
        </p>
      </header>

      <section id="PlatformPlugin" className="space-y-3 scroll-mt-20">
        <h2 className="text-2xl font-semibold">
          <code>PlatformPlugin</code>
        </h2>
        <p className="text-muted-foreground">
          The top-level manifest. A plugin registers via{' '}
          <code>registerPlugin(plugin, ctx)</code>; re-registering the same{' '}
          <code>name</code> throws so callers get an obvious signal instead
          of silent overwrites.
        </p>
        <CodeSample language="ts">{`interface PlatformPlugin {
  readonly name: string;          // 'tizen', 'webos', 'androidtv', ...
  readonly displayName: string;   // 'Samsung Tizen', 'LG webOS', ...
  readonly commands?: CliCommand[];
  readonly packager?: Packager;
  readonly launcher?: Launcher;
  readonly emulator?: EmulatorDriver;
  readonly publisher?: Publisher;
}

function registerPlugin(plugin: PlatformPlugin, ctx: CliContext): void;`}</CodeSample>
      </section>

      <section id="Packager" className="space-y-3 scroll-mt-20">
        <h2 className="text-2xl font-semibold">
          <code>Packager</code>
        </h2>
        <p className="text-muted-foreground">
          Turns a built web bundle into a platform-specific installable
          (Tizen <code>.wgt</code>, webOS <code>.ipk</code>, Android/Fire TV
          APK, or a partner submission bundle).
        </p>
        <CodeSample language="ts">{`interface BuildOptions {
  readonly projectDir: string;
  readonly outDir: string;
  readonly release: boolean;
  readonly signingConfig?: string;
}

interface BuildResult {
  readonly artifactPath: string;
  readonly metadata?: Record<string, string>;
}

interface Packager {
  readonly platform: string;
  build(options: BuildOptions): Promise<BuildResult>;
}`}</CodeSample>
      </section>

      <section id="Launcher" className="space-y-3 scroll-mt-20">
        <h2 className="text-2xl font-semibold">
          <code>Launcher</code>
        </h2>
        <p className="text-muted-foreground">
          Takes a built artifact and sideloads it onto a device or emulator
          via the platform&apos;s SDK tool (<code>sdb install</code>,{' '}
          <code>ares-install</code>, <code>adb install</code>). Wraps the
          packager so <code>tvkit run</code> can build and launch in a
          single call.
        </p>
        <CodeSample language="ts">{`interface LaunchOptions {
  readonly deviceId: string;
  readonly projectDir: string;
  readonly packager: Packager;
  readonly devServerPort: number;
  readonly release: boolean;
}

interface Launcher {
  readonly platform: string;
  run(options: LaunchOptions): Promise<void>;
}`}</CodeSample>
      </section>

      <section id="EmulatorDriver" className="space-y-3 scroll-mt-20">
        <h2 className="text-2xl font-semibold">
          <code>EmulatorDriver</code>
        </h2>
        <p className="text-muted-foreground">
          Installs, starts, stops, and removes the emulator for a single
          platform. Platforms with no public emulator still register a
          plugin but report{' '}
          <code>{`supported: { reason }`}</code> so the CLI can surface a
          useful message instead of pretending the command is available.
        </p>
        <CodeSample language="ts">{`interface EmulatorStatus {
  readonly platform: string;
  readonly installed: boolean;
  readonly running: boolean;
  readonly version?: string;
  readonly installPath?: string;
}

interface EmulatorDriver {
  readonly platform: string;
  readonly supported: true | { reason: string };
  status(): Promise<EmulatorStatus>;
  install(): Promise<void>;
  start(options?: { version?: string }): Promise<void>;
  stop(): Promise<void>;
  remove(): Promise<void>;
}`}</CodeSample>
      </section>

      <section id="Publisher" className="space-y-3 scroll-mt-20">
        <h2 className="text-2xl font-semibold">
          <code>Publisher</code>
        </h2>
        <p className="text-muted-foreground">
          Uploads the built artifact to the platform&apos;s store, or
          produces a submission bundle for partner-gated platforms.{' '}
          <code>tier</code> advertises how much of the flow is automated —
          the CLI uses it to set user expectations.
        </p>
        <CodeSample language="ts">{`type PublishTier = 'automatable' | 'semi-automatable' | 'partner-gated';

interface PublishMetadata {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly iconPath?: string;
  readonly screenshots?: string[];
}

interface PublishOptions {
  readonly artifactPath: string;
  readonly release: boolean;
  readonly metadata: PublishMetadata;
}

interface PublishResult {
  readonly submissionId?: string;
  readonly statusUrl?: string;
  readonly manualSteps?: string[];
}

interface Publisher {
  readonly platform: string;
  readonly tier: PublishTier;
  publish(options: PublishOptions): Promise<PublishResult>;
}`}</CodeSample>
      </section>

      <section id="author" className="space-y-3 scroll-mt-20">
        <h2 className="text-2xl font-semibold">
          Authoring a new platform plugin
        </h2>
        <p className="text-muted-foreground">
          A new plugin is a package under{' '}
          <code>packages/platform-&lt;name&gt;/</code> that exports a
          manifest implementing the interfaces above. The shape mirrors the
          existing platforms — browse{' '}
          <code>packages/platform-tizen/src/plugin.ts</code> in the tvkit
          repo for the reference implementation.
        </p>
        <CodeSample language="ts">{`// packages/platform-myos/src/plugin.ts
import type { PlatformPlugin } from '@tvkit/cli';

import { myosPackager } from './packager.js';
import { myosEmulator } from './emulator.js';
import { myosPublisher } from './publisher.js';
import { myosLauncher } from './launcher.js';

export const myosPlugin: PlatformPlugin = {
  name: 'myos',
  displayName: 'MyOS',
  packager: myosPackager,
  launcher: myosLauncher,
  emulator: myosEmulator,
  publisher: myosPublisher,
};`}</CodeSample>
        <p className="text-muted-foreground">
          Register the plugin from the CLI entry point so it shows up in{' '}
          <code>tvkit --help</code>, <code>tvkit build</code>, and{' '}
          <code>tvkit emulator list</code>.
        </p>
        <CodeSample language="ts">{`import { registerPlugin } from '@tvkit/cli';
import { myosPlugin } from '@tvkit/platform-myos';

registerPlugin(myosPlugin, ctx);`}</CodeSample>
        <p className="text-sm text-muted-foreground">
          If your platform has no public SDK emulator, set{' '}
          <code>
            emulator.supported = {`{ reason: 'No public SDK available' }`}
          </code>{' '}
          and return a sensible{' '}
          <code>EmulatorStatus</code> from <code>status()</code>. The CLI
          renders the reason in place of the{' '}
          <code>install</code> / <code>start</code> actions.
        </p>
      </section>
    </div>
  )
}
