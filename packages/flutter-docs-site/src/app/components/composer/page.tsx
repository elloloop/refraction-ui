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
    </div>
  )
}
