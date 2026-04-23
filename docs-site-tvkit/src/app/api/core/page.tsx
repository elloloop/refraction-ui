import { CodeSample } from '@/components/code-sample'

export const metadata = {
  title: 'API — @tvkit/core',
}

interface SymbolProps {
  name: string
  kind: 'function' | 'type' | 'const'
  children: React.ReactNode
}

function Symbol({ name, kind, children }: SymbolProps) {
  return (
    <section id={name} className="space-y-3 scroll-mt-20">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-2xl font-semibold">
          <code className="font-mono">{name}</code>
        </h2>
        <span className="rounded-md border border-border px-2 py-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          {kind}
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export default function ApiCorePage() {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">
          API — <code className="font-mono">@tvkit/core</code>
        </h1>
        <p className="text-lg text-muted-foreground">
          The runtime shim. Platform detection, unified remote input, back /
          exit handling, on-screen keyboard prompts, and voice-to-text.
          Depends on nothing; safe in SSR / Node.
        </p>
        <CodeSample>{`import {
  detectPlatform,
  createTvInput,
  createNavigation,
  promptText,
  promptVoice,
  getCapabilities,
} from '@tvkit/core';`}</CodeSample>
      </header>

      <Symbol name="detectPlatform" kind="function">
        <p className="text-muted-foreground">
          Detect the current smart TV platform from browser globals and the
          user-agent string. Precedence: <code>tizen</code> &rarr;{' '}
          <code>webos</code> &rarr; <code>firetv</code> (before{' '}
          <code>androidtv</code> because Fire TV&apos;s UA also contains
          &ldquo;Android&rdquo;) &rarr; <code>androidtv</code> &rarr;{' '}
          <code>vidaa</code> &rarr; <code>smartcast</code> &rarr;{' '}
          <code>titan</code> &rarr; <code>zeasn</code> &rarr;{' '}
          <code>&apos;unknown&apos;</code>. Safe in non-browser environments.
        </p>
        <CodeSample language="ts">{`function detectPlatform(): TvPlatform;

type TvPlatform =
  | 'tizen' | 'webos' | 'androidtv' | 'firetv'
  | 'vidaa' | 'smartcast' | 'titan' | 'zeasn'
  | 'unknown';`}</CodeSample>
        <CodeSample language="ts">{`import { detectPlatform } from '@tvkit/core';

const platform = detectPlatform();
if (platform === 'tizen') {
  // Samsung-specific setup
}`}</CodeSample>
        <p className="text-sm text-muted-foreground">
          Companions: <code>detectPlatformVersion()</code> returns the
          best-effort version string (e.g. Tizen 6.5, webOS 6.0);{' '}
          <code>detectDeviceInfo()</code> returns{' '}
          <code>{`{ make?, model?, resolution? }`}</code>.
        </p>
      </Symbol>

      <Symbol name="createTvInput" kind="function">
        <p className="text-muted-foreground">
          Attach <code>keydown</code> / <code>keyup</code> listeners and
          normalize native <code>KeyboardEvent</code>s into <code>TvKeyEvent</code>s
          keyed on tvkit&apos;s logical key set. In SSR / Node with no{' '}
          <code>target</code>, a detached <code>EventTarget</code> is used so
          the returned object is inert.
        </p>
        <CodeSample language="ts">{`interface CreateTvInputOptions {
  platform?: string; // defaults to 'unknown'; pass detectPlatform()
  target?: EventTarget; // defaults to window
}

function createTvInput(options?: CreateTvInputOptions): TvInput;

interface TvInput {
  on(type: 'keydown' | 'keyup', listener: TvKeyListener): () => void;
  off(type: 'keydown' | 'keyup', listener: TvKeyListener): void;
  dispose(): void;
}`}</CodeSample>
        <CodeSample language="ts">{`import { createTvInput, detectPlatform } from '@tvkit/core';

const input = createTvInput({ platform: detectPlatform() });

const off = input.on('keydown', (event) => {
  if (event.key === 'Ok') activate();
  if (event.key === 'Up') moveFocus(-1);
});

// Later, to tear down:
input.dispose();`}</CodeSample>
      </Symbol>

      <Symbol name="TvKeyEvent" kind="type">
        <p className="text-muted-foreground">
          The normalized event dispatched by <code>createTvInput</code>.{' '}
          <code>key</code> is the logical symbol (see <code>TV_KEYS</code> for
          the full list); the raw native event is exposed via{' '}
          <code>nativeEvent</code> for escape-hatch access.
        </p>
        <CodeSample language="ts">{`interface TvKeyEvent {
  readonly key: TvKey; // 'Up' | 'Down' | 'Left' | 'Right' | 'Ok' | 'Back' | ...
  readonly type: 'keydown' | 'keyup';
  readonly repeat: boolean;
  readonly timestamp: number;
  readonly nativeEvent: KeyboardEvent;
  readonly platform: string;
  preventDefault(): void;
  stopPropagation(): void;
}

type TvKey =
  | 'Up' | 'Down' | 'Left' | 'Right'
  | 'Ok' | 'Back' | 'Exit' | 'Home' | 'Menu'
  | 'MediaPlay' | 'MediaPause' | 'MediaStop'
  | 'MediaFastForward' | 'MediaRewind' | 'MediaPlayPause'
  | 'ChannelUp' | 'ChannelDown'
  | 'VolumeUp' | 'VolumeDown' | 'Mute'
  | 'ColorRed' | 'ColorGreen' | 'ColorYellow' | 'ColorBlue'
  | 'Digit0' | 'Digit1' | ... | 'Digit9'
  | 'Unknown';`}</CodeSample>
      </Symbol>

      <Symbol name="createNavigation" kind="function">
        <p className="text-muted-foreground">
          Unified back / exit controller. Register one or more{' '}
          <code>BackHandler</code>s with <code>onBack</code>; the most
          recently registered handler runs first (LIFO). Return{' '}
          <code>true</code> or call <code>event.preventDefault()</code> to
          mark the back event handled and suppress the platform default.
        </p>
        <CodeSample language="ts">{`interface CreateNavigationOptions {
  platform?: string; // defaults to detectPlatform()
  input?: TvInput;   // optional shared TvInput to subscribe on
}

function createNavigation(options?: CreateNavigationOptions): NavigationController;

interface NavigationController {
  onBack(handler: BackHandler): () => void;
  exit(): void;          // platform-appropriate app close
  dispose(): void;
}

interface BackHandler {
  (event: TvKeyEvent): void | boolean;
}`}</CodeSample>
        <CodeSample language="ts">{`import { createNavigation } from '@tvkit/core';

const nav = createNavigation();

nav.onBack(() => {
  if (modalOpen) {
    closeModal();
    return true; // swallow the back event
  }
  // returning void lets the next handler run
});

// Programmatic exit — routes to tizen.application, webOS.platformBack, etc.
quitButton.addEventListener('click', () => nav.exit());`}</CodeSample>
      </Symbol>

      <Symbol name="promptText" kind="function">
        <p className="text-muted-foreground">
          Prompt the user for a line of text via the platform&apos;s
          on-screen keyboard. Creates a visually-hidden <code>&lt;input&gt;</code>,
          focuses it (which surfaces the native OSK on every web TV
          platform), and resolves with the entered string on Enter or{' '}
          <code>null</code> on Back. Safe in non-browser environments —
          resolves <code>null</code> immediately when <code>document</code> is
          undefined.
        </p>
        <CodeSample language="ts">{`interface PromptTextOptions {
  initial?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'number' | 'password';
  maxLength?: number;
}

function promptText(options?: PromptTextOptions): Promise<string | null>;
function supportsNativeOsk(platform?: string): boolean;`}</CodeSample>
        <CodeSample language="ts">{`import { promptText } from '@tvkit/core';

const query = await promptText({
  placeholder: 'Search...',
  maxLength: 120,
});
if (query !== null) {
  runSearch(query);
}`}</CodeSample>
      </Symbol>

      <Symbol name="promptVoice" kind="function">
        <p className="text-muted-foreground">
          Prompt the user for a voice utterance and resolve with the final
          transcript. Prefers <code>webkitSpeechRecognition</code> (broad
          Chromium-WebView coverage); resolves <code>null</code> when no
          voice API is available, permission is denied, the recognizer
          errors out, or <code>timeoutMs</code> elapses.
        </p>
        <CodeSample language="ts">{`interface PromptVoiceOptions {
  lang?: string;        // BCP-47, default 'en-US'
  timeoutMs?: number;   // default 10000
}

interface CoreCapabilities {
  voice: boolean;
}

function promptVoice(options?: PromptVoiceOptions): Promise<string | null>;
function getCapabilities(): CoreCapabilities;`}</CodeSample>
        <CodeSample language="ts">{`import { promptVoice, getCapabilities } from '@tvkit/core';

if (!getCapabilities().voice) {
  voiceButton.disabled = true;
} else {
  voiceButton.addEventListener('click', async () => {
    const text = await promptVoice({ lang: 'en-US' });
    if (text) runSearch(text);
  });
}`}</CodeSample>
      </Symbol>

      <Symbol name="mapKeyCode" kind="function">
        <p className="text-muted-foreground">
          Map a platform + native <code>keyCode</code> / <code>key</code>{' '}
          pair to a logical <code>TvKey</code>. You normally don&apos;t need
          this directly — <code>createTvInput</code> uses it internally —
          but it is exported for advanced adapters.
        </p>
        <CodeSample language="ts">{`function mapKeyCode(
  platform: string,
  keyCode: number,
  key?: string,
): TvKey;`}</CodeSample>
      </Symbol>
    </div>
  )
}
