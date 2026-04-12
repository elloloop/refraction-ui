const fs = require('fs');
const path = require('path');

const angularDirs = fs.readdirSync('packages').filter(dir => dir.startsWith('angular-') && dir !== 'angular-meta');

// Update package.json
const pkgJsonPath = 'packages/angular-meta/package.json';
const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

if (!pkgJson.dependencies) pkgJson.dependencies = {};
angularDirs.forEach(dir => {
  pkgJson.dependencies[`@refraction-ui/${dir}`] = 'workspace:*';
});

fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');

// Update src/index.ts
const indexPath = 'packages/angular-meta/src/index.ts';
let indexContent = fs.readFileSync(indexPath, 'utf-8');
indexContent = indexContent.replace('export {}', '');

angularDirs.forEach(dir => {
  const exportLine = `export * from '@refraction-ui/${dir}'`;
  if (!indexContent.includes(exportLine)) {
    indexContent += exportLine + '\n';
  }
});

fs.writeFileSync(indexPath, indexContent);
