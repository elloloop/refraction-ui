import { Command } from 'commander';
import { safeWrite, type WriteOptions } from '../lib/fs-utils';

const DEFAULT_GLOBALS_CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;

    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;

    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;

    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;

    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;

    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;

    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;

    --radius: 0.5rem;

    --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
    --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;

    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;

    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;

    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;

    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;

    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;

    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;

    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;

const TAILWIND_CONFIG = `import type { Config } from 'tailwindcss'
import { refractionPreset } from '@refraction-ui/tailwind-config'

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  presets: [refractionPreset],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
`;

export function registerInit(program: Command) {
  program
    .command('init')
    .description('Bootstrap a new Refraction UI project with theme CSS and Tailwind config')
    .option('--css <path>', 'Path for globals.css', 'src/globals.css')
    .option('--tailwind <path>', 'Path for tailwind config', 'tailwind.config.ts')
    .option('--force', 'Overwrite existing files')
    .action(async (opts) => {
      const dryRun = program.opts().dryRun ?? false;
      const overwrite = opts.force ?? false;
      const writeOpts: WriteOptions = { overwrite, dryRun };

      console.log('');
      console.log('Initializing Refraction UI...');
      console.log('');

      try {
        await safeWrite(opts.css, DEFAULT_GLOBALS_CSS, writeOpts);
      } catch {
        console.log(`  Skipping ${opts.css} (already exists, use --force to overwrite)`);
      }

      try {
        await safeWrite(opts.tailwind, TAILWIND_CONFIG, writeOpts);
      } catch {
        console.log(`  Skipping ${opts.tailwind} (already exists, use --force to overwrite)`);
      }

      console.log('');
      console.log('Next steps:');
      console.log('');
      console.log('  1. Install dependencies:');
      console.log('     pnpm add @refraction-ui/react-theme @refraction-ui/tailwind-config');
      console.log('');
      console.log('  2. Add components:');
      console.log('     pnpm add @refraction-ui/react-button @refraction-ui/react-dialog');
      console.log('');
      console.log('  3. Wrap your app with ThemeProvider:');
      console.log('     import { ThemeProvider } from "@refraction-ui/react-theme"');
      console.log('');
      console.log('  4. Use components:');
      console.log('     import { Button } from "@refraction-ui/react-button"');
      console.log('');
    });

  program
    .command('add <component>')
    .description('Show the install command for a component')
    .action((component: string) => {
      const name = component.startsWith('react-') ? component : `react-${component}`;
      console.log('');
      console.log(`Install @refraction-ui/${name}:`);
      console.log('');
      console.log(`  pnpm add @refraction-ui/${name}`);
      console.log('');
      console.log('Usage:');
      console.log('');
      const pascal = component
        .replace(/^react-/, '')
        .split('-')
        .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
        .join('');
      console.log(`  import { ${pascal} } from "@refraction-ui/${name}"`);
      console.log('');
    });
}
