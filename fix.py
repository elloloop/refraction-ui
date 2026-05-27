import sys

with open('packages/flutter/example/lib/main.dart', 'r') as f:
    content = f.read()

content = content.replace('''      case '/docs/accordion':
      case '/docs/collapsible':
        return const CollapsiblePage();
        return const AccordionPage();''', '''      case '/docs/accordion':
        return const AccordionPage();
      case '/docs/collapsible':
        return const CollapsiblePage();''')

with open('packages/flutter/example/lib/main.dart', 'w') as f:
    f.write(content)
