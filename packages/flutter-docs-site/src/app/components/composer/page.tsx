import { FlutterPreview } from '@/components/flutter-preview'
import { CodeBlock } from '@/components/code-block'

export default function ComposerPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Composer</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A headless-core chat composer with auto-grow, IME-safe Enter-to-send,
          @mention / /slash / :emoji: trigger menus committing atomic tokens,
          attachments, drafts, edit-in-place, and busy/stop — the same
          structured output as the React composer.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Custom surface layout</h2>
        <p>The optional <code>layoutBuilder</code> arranges the existing editor,
          primary action and optional leading/trailing widgets inside one surface.
          Keep the editor mounted once in a stable location. Reuse the supplied
          primary action to preserve validation and the existing submit/controller reset.
          Native undo-history limitations are documented in COMPOSER_TESTING.md.
          <code>RefractionComposerStackedLayout</code> places a full-width editor
          above the toolbar. <code>RefractionComposerToolbar</code> wraps compact
          actions independently of the trailing primary button using theme spacing.</p>
        <CodeBlock language="dart" code={`RefractionComposer(
  layoutBuilder: (context, {required editor, required primary, leading, trailing}) => RefractionComposerStackedLayout(
    editor: editor,
    toolbar: RefractionComposerToolbar(
      actions: [?leading, ?trailing],
      primary: primary,
    ),
  ),
  onSubmit: sendMessage,
)`} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <FlutterPreview path="/docs/composer" height={480} />
        <div className="h-4"></div>
        <CodeBlock
          language="dart"
          code={`import 'package:refraction_ui/refraction_ui.dart';

class MyComposer extends StatelessWidget {
  const MyComposer({super.key, required this.onSend});

  final void Function(ComposerSubmission submission) onSend;

  @override
  Widget build(BuildContext context) {
    return RefractionComposer(
      placeholder: 'Message',
      maxLines: 6,
      triggers: [
        ComposerTrigger(
          id: 'mention',
          symbol: '@',
          resolve: (query) => searchTeam(query), // -> List<ComposerCandidate>
        ),
        ComposerTrigger(
          id: 'slash-command',
          symbol: '/',
          scope: ComposerTriggerScope.startOfMessage,
          resolve: (query) => searchCommands(query),
          buildDisplay: (c) => '/\${c.display}',
        ),
      ],
      onSubmit: onSend, // {plainText, tokens[{type,id,display,start,end}], attachments}
    );
  }
}`} />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Keyboard Unicode emoji</h2>
        <p>Typed and pasted Unicode uses bundled artwork for complete supported graphemes.
          The editing buffer, clipboard, selection and submission keep the original Unicode.
          Unsupported sequences and active IME composition stay native. Skin tones, flags
          and joined families are matched whole; modifiers are never removed.</p>
        <p><code>emojiRenderer: EmojiRenderer</code> defaults to <code>twemojiEmojiRenderer</code>.
          Use the same renderer on the picker and composer. For animated Noto artwork with
          Twemoji fallback and reduced-motion support, choose <code>refractionAnimatedEmojiRenderer</code>.
          Display message text with <code>refractionEmojiTextSpans(text, size: 18, renderer: refractionAnimatedEmojiRenderer)</code>.</p>
        <CodeBlock language="dart" code={`RefractionComposer(
  emojiRenderer: refractionAnimatedEmojiRenderer,
  onSubmit: (draft) => save(draft.plainText),
)`} />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Platform input formatters</h2>
        <p>
          The optional <code>inputFormatters: List&lt;TextInputFormatter&gt;?</code> prop
          follows Flutter TextField semantics. Formatters run in order for keyboard and
          paste edits; programmatic controller writes bypass them. Keep a formatter
          instance stable when briefly holding input during local durable acceptance.
          The host must separately guard submission and controller actions.
        </p>
        <CodeBlock language="dart" code={`import 'package:flutter/services.dart';

// State-owned; read the current host acceptance flag on each edit.
late final inputGate = TextInputFormatter.withFunction(
  (oldValue, newValue) => savingLocally ? oldValue : newValue,
);

RefractionComposer(
  inputFormatters: [inputGate],
  onSubmit: handleSubmission,
)`} />
        <p>
          Returning the previous value can hold text without disabling the field or
          changing focus. For normal formatting, preserve active IME composition;
          transform committed text only. This prop does not add asynchronous send
          acknowledgments to the composer.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Clipboard images</h2>
        <p>
          Set <code>onImagesPasted</code> to stage clipboard PNG/JPEG items in your
          existing attachment upload flow. Each <code>ComposerClipboardImage</code>
          supplies a name, MIME contentType and bytes. Paste never submits a message.
          Mixed text uses the editor&apos;s selection, formatters and undo history.
        </p>
        <CodeBlock language="dart" code={`RefractionComposer(
  controller: controller,
  onImagesPasted: (images) {
    for (final image in images) {
      // Your host starts an upload, stages its chip, then updates progress/status.
      stageUpload(image.name, image.contentType, image.bytes);
    }
  },
  onPasteError: reportClipboardError,
  onSubmit: handleSubmission,
)`} />
        <p>
          Desktop uses Cmd+V/Ctrl+V; Flutter context Paste also supports image-only
          clipboards. Web reads the user&apos;s browser paste event, without polling
          or requesting background clipboard access. Each item contributes PNG,
          otherwise JPEG. A read/size failure keeps the draft and shows
          <code> strings.pasteFailedNotice</code>; late results after editing,
          controller replacement or unmount are ignored. Images are bounded at
          100 MiB during reading; hosts still apply their upload limits and errors.
        </p>
        <p>
          <code>clipboardReader</code> injects a deterministic native test reader.
          Flutter&apos;s text-only Clipboard API requires the Superlist
          <code> super_clipboard</code> adapter for image formats and native
          TIFF/DIB conversion. macOS, iOS context Paste and Chromium have executable integration
          coverage. Windows, Linux, Android and mobile Safari remain unverified;
          software keyboards and multiple clipboard items have OS-specific limits.
          HTML image URLs, HEIC and Android keyboard content insertion are outside
          this clipboard API. Without the callback, existing text paste is unchanged.
          Every native consumer still builds the Superlist plugins. Android requires
          AGP/Gradle 8; AGP/Gradle 9 is unsupported by the current upstream adapter.
        </p>
      </section>
    </div>
  )
}
