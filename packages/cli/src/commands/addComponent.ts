import fs from 'fs-extra';
import path from 'path';

export async function addComponent(
  name: string,
  framework: 'react' | 'angular' = 'react',
  cwd: string = process.cwd(),
) {
  if (framework !== 'react' && framework !== 'angular') {
    throw new Error('Invalid framework');
  }
  const dir = path.join(cwd, 'packages', framework, name);
  await fs.ensureDir(dir);
  const file = path.join(dir, 'index.tsx');
  const content = `import React from 'react';\n\nexport const ${capitalize(name)} = () => {\n  return <div className=\"${name}\">${name}</div>;\n};\n`;
  await fs.outputFile(file, content, { flag: 'wx' }).catch(() => {});
  return file;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
