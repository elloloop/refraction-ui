import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const rootPackagesDir = path.resolve(__dirname, '..');

// 1. Clear and recreate dist
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 2. Resolve all workspace dependencies recursively
const workspaceDepsToCopy = new Set();

function resolveWorkspaceDeps(pkgDir) {
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) return;
  
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  const allDeps = { ...pkgJson.dependencies, ...pkgJson.devDependencies, ...pkgJson.peerDependencies };
  
  for (const dep of Object.keys(allDeps)) {
    if (dep.startsWith('@refraction-ui/')) {
      const folderName = dep.replace('@refraction-ui/', '');
      if (!workspaceDepsToCopy.has(folderName)) {
        workspaceDepsToCopy.add(folderName);
        resolveWorkspaceDeps(path.join(rootPackagesDir, folderName));
      }
    }
  }
}

resolveWorkspaceDeps(__dirname);

// 3. Copy files for each workspace dependency
const copiedPackages = Array.from(workspaceDepsToCopy);

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

for (const folderName of copiedPackages) {
  const srcPath = path.join(rootPackagesDir, folderName, 'src');
  const destPath = path.join(distDir, folderName);

  if (fs.existsSync(srcPath)) {
    copyDir(srcPath, destPath);
  }
}

// 4. Rewrite imports in all copied files
function rewriteImports(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (let entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      rewriteImports(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.astro')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      // Calculate relative depth to the base dist directory
      const relativeToDist = path.relative(path.dirname(fullPath), distDir);
      
      // Rewrite static imports
      content = content.replace(/from\s+['"]@refraction-ui\/([^'"]+)['"]/g, (match, pkgName) => {
        if (copiedPackages.includes(pkgName)) {
          const relativeImportPath = relativeToDist === '' 
            ? `./${pkgName}/index.ts` 
            : `${relativeToDist}/${pkgName}/index.ts`;
          return `from '${relativeImportPath}'`;
        }
        return match;
      });

      // Rewrite dynamic imports
      content = content.replace(/import\s*\(\s*['"]@refraction-ui\/([^'"]+)['"]\s*\)/g, (match, pkgName) => {
        if (copiedPackages.includes(pkgName)) {
          const relativeImportPath = relativeToDist === '' 
            ? `./${pkgName}/index.ts` 
            : `${relativeToDist}/${pkgName}/index.ts`;
          return `import('${relativeImportPath}')`;
        }
        return match;
      });

      fs.writeFileSync(fullPath, content);
    }
  }
}

rewriteImports(distDir);

// 5. Generate index.ts for the meta-package
let indexContent = '// Auto-generated meta-package index\n';
for (const folderName of copiedPackages) {
  // Only re-export astro-* components and core shared components directly expected by users
  if (folderName.startsWith('astro-') || folderName === 'shared') {
     indexContent += `export * from './${folderName}/index.ts';\n`;
  }
}
fs.writeFileSync(path.join(distDir, 'index.ts'), indexContent);

console.log('Astro meta-package built successfully. Copied packages:', copiedPackages.length);
