const fs = require('fs');
const path = require('path');

const newComponents = [
  'table-of-contents',
  'carousel',
  'slider',
  'pagination',
  'callout',
  'steps',
  'file-tree',
  'icon-system',
  'skip-to-content',
  'code-block',
  'link-card',
  'card-grid',
  'payment'
];
const frameworks = ['react', 'astro', 'angular', 'vue'];

frameworks.forEach(fw => {
  const pkgJsonPath = `packages/${fw}-meta/package.json`;
  const indexPath = `packages/${fw}-meta/src/index.ts`;

  if (fs.existsSync(pkgJsonPath)) {
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    if (!pkgJson.dependencies) pkgJson.dependencies = {};
    newComponents.forEach(comp => {
      const depName = `@refraction-ui/${fw}-${comp}`;
      // Note: for table-of-contents, the package might be @refraction-ui/react-table-of-contents
      pkgJson.dependencies[depName] = 'workspace:*';
    });
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');
  }

  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf-8');
    newComponents.forEach(comp => {
      const exportLine = `export * from '@refraction-ui/${fw}-${comp}'`;
      if (!indexContent.includes(exportLine)) {
        indexContent += `\n${exportLine}`;
      }
    });
    fs.writeFileSync(indexPath, indexContent + '\n');
  }
});
