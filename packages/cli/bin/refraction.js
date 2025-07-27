#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import { loadTokens, buildTokens, generateCSS, generateTailwind } from '../../tokens-core/index.js';
import fs from 'fs';

const program = new Command();
program
  .name('refraction-ui')
  .description('Refraction UI CLI');

const tokens = program.command('tokens');

tokens
  .command('build')
  .option('--tailwind', 'also generate Tailwind fragment')
  .option('-i, --input <file>', 'tokens file', 'refraction-tokens.json')
  .option('-o, --output <file>', 'css output', 'tokens.css')
  .action((opts) => {
    const file = path.resolve(process.cwd(), opts.input);
    if (!fs.existsSync(file)) {
      console.error('Tokens file not found:', file);
      process.exit(1);
    }
    const tokensData = loadTokens(file);
    const built = buildTokens(tokensData);
    const css = generateCSS(built);
    fs.writeFileSync(opts.output, css);
    console.log('Wrote', opts.output);
    if (opts.tailwind) {
      const fragment = generateTailwind(built);
      const twFile = 'tailwind.tokens.js';
      fs.writeFileSync(twFile, fragment);
      console.log('Wrote', twFile);
    }
  });

program.parse(process.argv);
