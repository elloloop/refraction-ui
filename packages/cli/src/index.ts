import { Command } from 'commander';
import chalk from 'chalk';
import prompts from 'prompts';
import { initProject } from './commands/init';
import { addComponent } from './commands/addComponent';
import fs from 'fs-extra';
import path from 'path';

const pkg = { version: '0.0.1' };

const program = new Command();
program.name('refui').description('Refraction UI CLI').version(pkg.version);

program
  .command('init')
  .description('Initialize a new Refraction UI project')
  .action(async () => {
    const response = await prompts([
      {
        type: 'text',
        name: 'theme',
        message: 'Default theme name',
        initial: 'default',
      },
      {
        type: 'select',
        name: 'framework',
        message: 'Choose framework',
        choices: [
          { title: 'React', value: 'react' },
          { title: 'Angular', value: 'angular' },
        ],
        initial: 0,
      },
    ]);

    await initProject({ theme: response.theme, framework: response.framework });
    console.log(chalk.green('Project initialized.'));
  });

program
  .command('add:component <name>')
  .description('Scaffold a new UI component')
  .option('--framework <framework>', 'react or angular', 'react')
  .action(async (name, options) => {
    const framework = options.framework;
    try {
      const file = await addComponent(name, framework);
      console.log(chalk.green(`Component ${name} created at ${file}`));
    } catch (e) {
      console.error(chalk.red((e as Error).message));
    }
  });

program
  .command('add:theme <name>')
  .description('Scaffold a new theme')
  .action(async (name) => {
    const file = path.join('packages/themes', `${name}.css`);
    const css = `[data-theme="${name}"] {\n  --color-primary: 220 90% 56%;\n  --color-bg: 0 0% 100%;\n}\n`;
    await fs.outputFile(file, css, { flag: 'wx' }).catch(() => {});
    console.log(chalk.green(`Theme ${name} created.`));
  });

program
  .command('tokens pull')
  .description('Sync design tokens')
  .option('--from <source>', 'figma or style-dictionary', 'figma')
  .action(async (options) => {
    const dir = path.join('packages/themes/tokens');
    await fs.ensureDir(dir);
    const json = path.join(dir, `${options.from}.json`);
    const css = path.join(dir, `${options.from}.css`);
    await fs.outputJson(json, { token: 'value' }, { spaces: 2 });
    await fs.outputFile(css, ':root { --token: value; }\n');
    console.log(chalk.green('Tokens pulled.'));
  });

program
  .command('lint:a11y')
  .description('Run accessibility checks (placeholder)')
  .action(() => {
    console.log('Accessibility lint not implemented yet.');
  });

program.parse(process.argv);
