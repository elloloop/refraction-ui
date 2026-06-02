import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'

export default function BadgePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Badge</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Flutter implementation of the Badge component.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock 
          language="dart"
          code={`import 'package:refraction_ui/refraction_ui.dart';

class MyBadgeExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Badge(
      // Add props here
    );
  }
}`} />
      </section>
    </div>
  )
}
