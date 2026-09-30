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
          primary action to preserve validation and the send-time undo reset.
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
    </div>
  )
}
