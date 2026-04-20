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

      // Add missing extensions to self-referential relative exports
      if (entry.name === 'index.ts') {
         content = content.replace(/export\s+\*\s+from\s+['"](\.\/[^'"]+)['"]/g, (match, target) => {
            if (target.endsWith('.ts') || target.endsWith('.astro') || target.endsWith('.tsx')) return match;
            
            const targetName = target.endsWith('.js') ? target.slice(0, -3).replace('./', '') : target.replace('./', '');
            const dir = path.dirname(fullPath);
            
            // For target ending with .js, we strictly rewrite to .ts since we know it mapped to TS
            if (target.endsWith('.js')) {
               return `export * from '${target.slice(0, -3)}.ts'`;
            }
            
            if (fs.existsSync(path.join(dir, targetName + '.astro'))) {
               // Must rewrite to default export for .astro
               const nameParts = targetName.replace(/^astro-/, '').split('-');
               const camelName = nameParts.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
               return `export { default as ${camelName} } from '${target}.astro'`;
            } else if (fs.existsSync(path.join(dir, targetName + '.ts'))) {
               return `export * from '${target}.ts'`;
            } else if (fs.existsSync(path.join(dir, targetName + '.tsx'))) {
               return `export * from '${target}.tsx'`;
            }
            return match;
         });
      }

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

// 6. Verify all re-exports resolve
for (const folderName of copiedPackages) {
  const indexTsPath = path.join(distDir, folderName, 'index.ts');
  if (fs.existsSync(indexTsPath)) {
    const content = fs.readFileSync(indexTsPath, 'utf8');
    
    // Check wildcard exports
    const importMatches = [...content.matchAll(/export \\* from '([^']+)'/g)];
    for (const match of importMatches) {
       const target = match[1];
       const targetPath = path.resolve(path.dirname(indexTsPath), target);
       if (!fs.existsSync(targetPath)) {
         console.error(`Missing file extension in ${folderName}/index.ts: ${target}`);
         process.exit(1);
       }
    }
    
    // Check named exports
    const namedMatches = [...content.matchAll(/export \\{.*\\} from '([^']+)'/g)];
    for (const match of namedMatches) {
       const target = match[1];
       const targetPath = path.resolve(path.dirname(indexTsPath), target);
       if (!fs.existsSync(targetPath)) {
         console.error(`Missing file extension in ${folderName}/index.ts: ${target}`);
         process.exit(1);
       }
    }
  }
}

console.log('Astro meta-package built successfully. Copied packages:', copiedPackages.length);
