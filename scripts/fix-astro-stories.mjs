import fs from 'fs';
import path from 'path';

const packagesDir = 'packages';
const packages = fs.readdirSync(packagesDir).filter(p => p.startsWith('astro-'));
const stories = [];
for (const pkg of packages) {
  const srcDir = path.join(packagesDir, pkg, 'src');
  if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    for (const file of files) {
      if (file.endsWith('.stories.ts')) {
        stories.push(path.join(srcDir, file));
      }
    }
  }
}

for (const file of stories) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix imports
  const componentName = path.basename(file, '.stories.ts');
  content = content.replace(/import Component from '\.\/.*\.astro'/, `import Component from './${componentName}.astro'`);

  // Remove render function block using a regex. 
  // It usually looks like:
  // render: (args: any) => { ... }
  // or render: (args) => { ... }
  // We'll replace everything from 'render:' to the end of the file, and close the object.
  // Wait, the safest way is to just replace the whole 'export const Default = ...' block.

  const argsMatch = content.match(/args:\s*({[\s\S]*?}),\s*render:/);
  if (argsMatch) {
    const argsStr = argsMatch[1];
    content = content.replace(/export const Default = {[\s\S]*/, `export const Default = {\n  args: ${argsStr}\n}\n`);
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
  } else {
    // maybe there's no render or it's different
    const renderMatch = content.match(/,\s*render:\s*\([^)]*\)\s*=>\s*{[\s\S]*?}\n}/);
    if (renderMatch) {
      content = content.replace(renderMatch[0], '\n}');
      fs.writeFileSync(file, content);
      console.log(`Fixed render without args in ${file}`);
    }
  }
}
