import { FlutterPreview } from '@/components/flutter-preview'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'

export default function DropdownMenuPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">DropdownMenu</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Flutter implementation of the DropdownMenu component.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Interactive icon triggers</h2>
        <p>Use triggerBuilder when the trigger is a button with its own tap handler. The supplied toggle opens or closes this menu; the existing trigger parameter remains available for passive content. Supply exactly one.</p>
        <CodeBlock language="dart" code={`RefractionDropdownMenu(
  triggerBuilder: (context, toggle) => RefractionButton(
    size: RefractionButtonSize.icon,
    semanticLabel: 'Dictation language',
    onPressed: toggle,
    child: const Icon(Icons.keyboard_arrow_down),
  ),
  items: [RefractionDropdownItem(label: 'English', onSelected: selectEnglish)],
)`} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <FlutterPreview path="/docs/dropdown-menu" />
        <div className="h-4"></div>
        <CodeBlock 
          language="dart"
          code={`import 'package:refraction_ui/refraction_ui.dart';

class MyDropdownMenuExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return DropdownMenu(
      // Add props here
    );
  }
}`} />
      </section>
    </div>
  )
}
