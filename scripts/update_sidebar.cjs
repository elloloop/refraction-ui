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

const regex = /const componentGroups = \[[\s\S]*?\]\n/;
const replacement = `const componentGroups = ${JSON.stringify(groups, null, 2).replace(/"([^"]+)":/g, '$1:')}\n`;

content = content.replace(regex, replacement);
fs.writeFileSync(sidebarPath, content);
console.log('Sidebar updated');
