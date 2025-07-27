import { Command } from 'commander';
import { safeWrite } from '../lib/fs-utils';

export function registerInit(program: Command) {
  program
    .command('init')
    .description('bootstrap project')
    .action(async () => {
      await safeWrite('refraction.txt', 'hello');
    });
}
