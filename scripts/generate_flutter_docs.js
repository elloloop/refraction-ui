const fs = require('fs');
const path = require('path');

const flutterComponentsDir = path.join(__dirname, '../packages/flutter/lib/src/components');
const docsComponentsDir = path.join(__dirname, '../packages/flutter-docs-site/src/app/components');

const files = fs.readdirSync(flutterComponentsDir).filter(f => f.endsWith('.dart'));

files.forEach(file => {
  const name = file.replace('.dart', '').replace(/_/g, '-');
  const className = file.replace('.dart', '').split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  
  const compDir = path.join(docsComponentsDir, name);
  if (!fs.existsSync(compDir)) {
    fs.mkdirSync(compDir, { recursive: true });
  }

  const pagePath = path.join(compDir, 'page.tsx');
  const pageContent = `import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'

export default function ${className}Page() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">${className}</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Flutter implementation of the ${className} component.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock 
          language="dart"
          code={\`import 'package:refraction_ui/refraction_ui.dart';

class My${className}Example extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ${className}(
      // Add props here
    );
  }
}\`} />
      </section>
    </div>
  )
}
`;

  fs.writeFileSync(pagePath, pageContent);
  console.log(`Generated docs for ${name}`);
});
