import { Command } from 'commander';
import { loadConfig } from './lib/config';
import { safeWrite } from './lib/fs-utils';
import pkg from '../package.json';
import { registerInit } from './commands/init';

export async function run(argv: string[] = process.argv) {
  const program = new Command();
  program
    .name('refraction-ui')
    .description('Refraction UI command line interface')
    .version(pkg.version)
    .option('--dry-run', 'preview actions without writing')
    .option('--verbose', 'output additional logs');

  program
    .command('config')
    .description('Show resolved configuration')
    .action(async () => {
      const config = await loadConfig();
      console.log(JSON.stringify(config, null, 2));
    });

  program
    .command('touch <file>')
    .description('create a file safely')
    .action(async (file: string) => {
      await safeWrite(file, '', { overwrite: false, dryRun: program.opts().dryRun });
      console.log('Created', file);
    });

registerInit(program);
  await program.parseAsync(argv);
}

if (require.main === module) {
  run();
}
