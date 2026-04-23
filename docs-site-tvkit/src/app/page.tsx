import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
} from '@/components/refraction-client'
import { CodeSample } from '@/components/code-sample'

export default function HomePage() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="space-y-8 pt-2">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge>v1 scope</Badge>
            <Badge variant="secondary">web-first runtime</Badge>
            <Badge variant="secondary">8 platforms</Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-gradient bg-gradient-to-r from-primary via-primary/80 to-primary/60">
              Write HTML/CSS/JS once,
            </span>
            <br />
            <span className="text-foreground">ship to every smart TV.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            tvkit is a Flutter-style toolkit for television. A small
            runtime that normalizes remote-control input, a CLI that
            packages your web bundle per platform, and emulator + publish
            automation for the stores that have them.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button asChild>
            <Link href="/getting-started">Get started</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/platforms">See platforms</Link>
          </Button>
        </div>

        <CodeSample title="Terminal">{`# Scaffold a new TV app
tvkit create myapp

# Install the Samsung Tizen emulator on demand
tvkit emulator install tizen

# Build, install, launch, and tail logs
tvkit run tizen`}</CodeSample>
      </section>

      {/* Feature cards */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Why tvkit
          </h2>
          <p className="mt-2 text-muted-foreground">
            One authoring stack, eight TV operating systems, zero custom VM.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>85–90% market coverage</CardTitle>
              <CardDescription>
                Samsung Tizen, LG webOS, Android TV, Fire TV, VIDAA,
                SmartCast, Titan OS, Zeasn — the eight web-capable TV
                platforms covering the vast majority of the global install
                base.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Flutter-style CLI</CardTitle>
              <CardDescription>
                <code className="text-xs">tvkit create</code>,{' '}
                <code className="text-xs">tvkit run</code>,{' '}
                <code className="text-xs">tvkit build &lt;platform&gt;</code>,{' '}
                <code className="text-xs">tvkit publish</code>. Emulators and
                platform SDKs install on demand.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Web-native runtime</CardTitle>
              <CardDescription>
                Author with the world&apos;s most documented stack. Bring any
                framework — React, Vue, Svelte, vanilla — tvkit ships the
                runtime shim and the publishing pipeline.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Links out */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/cli"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
        >
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            CLI reference
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Every command — <code>create</code>, <code>doctor</code>,{' '}
            <code>devices</code>, <code>emulator</code>, <code>build</code>,{' '}
            <code>run</code>, <code>logs</code>, <code>publish</code>.
          </p>
        </Link>
        <Link
          href="/api/core"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
        >
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            @tvkit/core API
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            <code>detectPlatform</code>, <code>createTvInput</code>,{' '}
            <code>createNavigation</code>, <code>promptText</code>,{' '}
            <code>promptVoice</code>.
          </p>
        </Link>
        <Link
          href="/architecture"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
        >
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            Architecture
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Why tvkit is web-first, and why Roku and tvOS are deferred.
          </p>
        </Link>
        <Link
          href="/publishing"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
        >
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            Publishing
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Which stores can be automated, which are semi-automatable, which
            require a partner relationship.
          </p>
        </Link>
      </section>
    </div>
  )
}
