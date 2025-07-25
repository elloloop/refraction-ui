#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import Ajv from 'ajv';
import chokidar from 'chokidar';
import postcss from 'postcss';
import scssSyntax from 'postcss-scss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA_PATH = path.resolve(__dirname, 'docs/contracts/schemas/tokens.schema.json');
const DEFAULT_TOKENS_FILE = 'refraction-tokens.json';
const DEFAULT_OUTPUT_DIR = 'styles';

function loadSchema() {
  return JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
}

function validateTokens(data, strict = false) {
  const ajv = new Ajv({ allErrors: true, strict });
  const validate = ajv.compile(loadSchema());
  const valid = validate(data);
  if (!valid) {
    const msg = ajv.errorsText(validate.errors, { separator: '\n' });
    throw new Error(msg);
  }
}

function flattenTokens(obj, prefix = '') {
  let flat = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}-${key}` : key;
    if (value && typeof value === 'object' && !('value' in value)) {
      Object.assign(flat, flattenTokens(value, newKey));
    } else if (value && typeof value === 'object' && 'value' in value) {
      flat[newKey] = value.value;
    } else {
      flat[newKey] = value;
    }
  }
  return flat;
}

function resolveReferences(tokens) {
  const flat = flattenTokens(tokens);
  const resolved = {};
  const refRegex = /{([^}]+)}/g;
  for (const [key, value] of Object.entries(flat)) {
    let val = value;
    if (typeof value === 'string') {
      val = value.replace(refRegex, (_, ref) => {
        return flat[ref] || value;
      });
    }
    resolved[key] = val;
  }
  return resolved;
}

function buildCSS(vars, sourcemap) {
  const lines = [':root {'];
  Object.entries(vars).forEach(([k, v]) => {
    lines.push(`  --${k}: ${v};`);
  });
  lines.push('}');
  const css = lines.join('\n');
  if (!sourcemap) return { css };
  return postcss([])
    .process(css, { from: undefined, map: { inline: false } })
    .then(res => ({ css: res.css, map: res.map.toString() }));
}

function buildSCSS(vars) {
  const lines = [];
  Object.entries(vars).forEach(([k, v]) => {
    lines.push(`$${k}: ${v};`);
  });
  return lines.join('\n');
}

function buildTailwind(vars) {
  return `module.exports = { theme: ${JSON.stringify(vars, null, 2)} };`;
}

async function build(opts) {
  const tokensPath = path.resolve(opts.file || DEFAULT_TOKENS_FILE);
  if (!fs.existsSync(tokensPath)) throw new Error(`Tokens file ${tokensPath} not found`);

  const data = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  validateTokens(data, true);
  const resolved = resolveReferences(data.themes || data);

  const outDir = path.resolve(opts.output || DEFAULT_OUTPUT_DIR);
  fs.mkdirSync(outDir, { recursive: true });

  const vars = resolved;
  const tasks = [];
  if (opts.format.includes('css')) {
    tasks.push(
      buildCSS(vars, opts.sourcemap).then(res => {
        fs.writeFileSync(path.join(outDir, 'tokens.css'), res.css);
        if (res.map) fs.writeFileSync(path.join(outDir, 'tokens.css.map'), res.map);
      })
    );
  }
  if (opts.format.includes('scss')) {
    fs.writeFileSync(path.join(outDir, 'tokens.scss'), buildSCSS(vars));
  }
  if (opts.format.includes('tailwind')) {
    fs.writeFileSync(path.join(outDir, 'tailwind-tokens.cjs'), buildTailwind(vars));
  }
  await Promise.all(tasks);
  if (opts.verbose) console.log('Tokens build complete');
}

function hashFile(file) {
  const data = fs.readFileSync(file);
  return require('crypto').createHash('sha1').update(data).digest('hex');
}

async function buildWithCache(opts) {
  const tokensPath = path.resolve(opts.file || DEFAULT_TOKENS_FILE);
  const hash = hashFile(tokensPath);
  const cacheFile = path.join(path.dirname(tokensPath), '.tokens-build.hash');
  if (fs.existsSync(cacheFile)) {
    const prev = fs.readFileSync(cacheFile, 'utf-8');
    if (prev === hash) {
      if (opts.verbose) console.log('No changes detected, skipping build');
      return;
    }
  }
  await build(opts);
  fs.writeFileSync(cacheFile, hash);
}

function watch(opts) {
  const tokensPath = path.resolve(opts.file || DEFAULT_TOKENS_FILE);
  chokidar.watch(tokensPath).on('change', () => {
    buildWithCache({ ...opts, verbose: true }).catch(err => console.error(err.message));
  });
  console.log('Watching tokens file for changes...');
}

yargs(hideBin(process.argv))
  .command('tokens build', 'build tokens', y => {
    y.option('file', { type: 'string', describe: 'tokens JSON file' })
      .option('output', { type: 'string', describe: 'output directory' })
      .option('format', { type: 'array', default: ['css'], describe: 'css, scss, tailwind' })
      .option('sourcemap', { type: 'boolean', default: false })
      .option('verbose', { type: 'boolean', default: false });
  }, argv => {
    buildWithCache(argv).catch(err => {
      console.error(err.message);
      process.exit(1);
    });
  })
  .command('tokens validate', 'validate tokens', y => {
    y.option('file', { type: 'string', describe: 'tokens JSON file' });
  }, argv => {
    const tokensPath = path.resolve(argv.file || DEFAULT_TOKENS_FILE);
    const data = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
    try {
      validateTokens(data, true);
      console.log('Tokens valid');
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  })
  .command('tokens watch', 'watch tokens and build on change', y => {
    y.option('file', { type: 'string' })
      .option('output', { type: 'string' })
      .option('format', { type: 'array', default: ['css'] });
  }, argv => {
    watch(argv);
  })
  .demandCommand(1)
  .help()
  .argv;

