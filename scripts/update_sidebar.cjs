const fs = require('fs');
const path = require('path');

const flutterComponentsDir = path.join(__dirname, '../packages/flutter/lib/src/components');
const files = fs.readdirSync(flutterComponentsDir).filter(f => f.endsWith('.dart'));

const items = files.map(file => {
  const name = file.replace('.dart', '').replace(/_/g, '-');
  const label = file.replace('.dart', '').split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  return { name: label, href: `/components/${name}` };
});

const groups = [
  {
    title: 'All Components',
    items: items
  }
];

const sidebarPath = path.join(__dirname, '../packages/flutter-docs-site/src/components/sidebar.tsx');
let content = fs.readFileSync(sidebarPath, 'utf8');

const startStr = 'const componentGroups = [';
const startIndex = content.indexOf(startStr);
if (startIndex !== -1) {
  let depth = 1;
  let i = startIndex + startStr.length;
  while (depth > 0 && i < content.length) {
    if (content[i] === '[') depth++;
    else if (content[i] === ']') depth--;
    i++;
  }
  const replacement = `const componentGroups = ${JSON.stringify(groups, null, 2).replace(/"([^"]+)":/g, '$1:')}`;
  content = content.slice(0, startIndex) + replacement + content.slice(i);
} else {
  console.error('Could not find componentGroups in sidebar.tsx');
  process.exit(1);
}

fs.writeFileSync(sidebarPath, content);
console.log('Sidebar updated');
