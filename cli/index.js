#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

const program = new Command();

function detectFramework(pkg) {
  const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
  if (!deps) return null;
  if (deps.next) return 'next';
  if (deps['react-scripts']) return 'cra';
  if (deps.vite) return 'vite';
  return null;
}

function detectTs(projectDir) {
  return fs.existsSync(path.join(projectDir, 'tsconfig.json'));
}

function patchTailwindConfig(projectDir) {
  const configNames = [
    'tailwind.config.js',
    'tailwind.config.ts',
    'tailwind.config.cjs',
  ];
  const file = configNames.find((name) => fs.existsSync(path.join(projectDir, name)));
  if (!file) return;
  const filePath = path.join(projectDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('refraction-ui')) {
    const pluginLine = "require('@refraction-ui/tailwind-preset')";
    if (content.includes('plugins: [')) {
      content = content.replace(/plugins:\s*\[/, `plugins: [\n    ${pluginLine},`);
    } else {
      content += `\nmodule.exports.plugins = [${pluginLine}];\n`;
    }
    fs.writeFileSync(filePath, content);
  }
}

function addTokenCss(projectDir) {
  const stylesDir = path.join(projectDir, 'src', 'styles');
  fse.ensureDirSync(stylesDir);
  const tokenFile = path.join(stylesDir, 'refraction.css');
  if (!fs.existsSync(tokenFile)) {
    fs.writeFileSync(tokenFile, '/* Refraction design tokens */\n');
  }
}

function integrateThemeProvider(projectDir, framework, isTs) {
  if (framework === 'next') {
    const appFile = path.join(projectDir, 'pages', '_app.' + (isTs ? 'tsx' : 'js'));
    if (fs.existsSync(appFile)) {
      let content = fs.readFileSync(appFile, 'utf8');
      if (!content.includes('ThemeProvider')) {
        content = content.replace('function MyApp({ Component, pageProps }) {',
          `import { ThemeProvider } from '@refraction-ui/react';\nfunction MyApp({ Component, pageProps }) {`);
        content = content.replace('<Component {...pageProps} />', '<ThemeProvider><Component {...pageProps} /></ThemeProvider>');
        fs.writeFileSync(appFile, content);
      }
    }
  } else {
    const srcFile = ['src/main.', 'src/index.']
      .map((base) => base + (isTs ? 'tsx' : 'jsx'))
      .find((f) => fs.existsSync(path.join(projectDir, f.replace(/\.jsx?$/, '.js')))
                || fs.existsSync(path.join(projectDir, f)));
    const filePath = srcFile && (fs.existsSync(path.join(projectDir, srcFile)) ?
      path.join(projectDir, srcFile) : path.join(projectDir, srcFile.replace(/\.jsx?$/, '.js')));
    if (filePath && fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (!content.includes('ThemeProvider')) {
        content = `import { ThemeProvider } from '@refraction-ui/react';\n` + content;
        content = content.replace('<App />', '<ThemeProvider><App /></ThemeProvider>');
        fs.writeFileSync(filePath, content);
      }
    }
  }
}

program
  .command('init [dir]')
  .description('initialize Refraction UI in a project')
  .action((dir = '.') => {
    const projectDir = path.resolve(process.cwd(), dir);
    const pkgPath = path.join(projectDir, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      console.error('No package.json found in', projectDir);
      process.exit(1);
    }
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const framework = detectFramework(pkg);
    const isTs = detectTs(projectDir);
    patchTailwindConfig(projectDir);
    addTokenCss(projectDir);
    integrateThemeProvider(projectDir, framework, isTs);
    console.log('Refraction UI initialized for', framework || 'unknown framework');
  });

program.parse(process.argv);
