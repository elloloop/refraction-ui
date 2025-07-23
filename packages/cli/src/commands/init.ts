import fs from 'fs-extra';
import path from 'path';

export interface InitOptions {
  theme?: string;
  framework?: 'react' | 'angular';
}

export async function initProject(options: InitOptions & { cwd?: string } = {}) {
  const theme = options.theme ?? 'default';
  const cwd = options.cwd ?? process.cwd();

  const resolve = (...p: string[]) => path.join(cwd, ...p);

  await fs.ensureDir(resolve('packages'));
  for (const dir of ['core', 'react', 'angular', 'themes', 'cli', 'playground']) {
    await fs.ensureDir(resolve('packages', dir));
  }

  const readme = '# Refraction UI\n';
  await fs.outputFile(resolve('README.md'), readme, { flag: 'wx' }).catch(() => {});

  const tailwind = `module.exports = {\n  content: ['src/**/*.{ts,tsx}'],\n  theme: { extend: {} },\n  plugins: [],\n}`;
  await fs.outputFile(resolve('tailwind.config.js'), tailwind, { flag: 'wx' }).catch(() => {});

  const rootPkg = {
    name: 'refraction-ui-project',
    private: true,
    version: '0.0.1',
  };
  await fs.outputJson(resolve('package.json'), rootPkg, { spaces: 2, flag: 'wx' }).catch(() => {});

  const themeFile = resolve('packages/themes', `${theme}.css`);
  const css = `[data-theme="${theme}"] {\n  --color-primary: 220 90% 56%;\n  --color-bg: 0 0% 100%;\n}\n`;
  await fs.outputFile(themeFile, css, { flag: 'wx' }).catch(() => {});
}
