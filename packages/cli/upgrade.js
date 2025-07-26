#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const diff3 = require('diff3');

function parseHeader(content) {
  const versionMatch = content.match(/@refraction-version\s+(\S+)/);
  const compMatch = content.match(/@refraction-component\s+(\S+)/);
  return {
    version: versionMatch ? versionMatch[1] : null,
    component: compMatch ? compMatch[1] : null,
  };
}

function mergeFiles(current, base, incoming) {
  const result = diff3(current.split('\n'), base.split('\n'), incoming.split('\n'));
  let merged = [];
  let conflict = false;
  for (const part of result) {
    if (part.ok) {
      merged.push(...part.ok);
    } else if (part.conflict) {
      conflict = true;
      merged.push('<<<<<<< current');
      merged.push(...part.conflict.a);
      merged.push('=======');
      merged.push(...part.conflict.b);
      merged.push('>>>>>>> incoming');
    }
  }
  return { text: merged.join('\n'), conflict };
}

function backupFile(file) {
  const ts = Date.now();
  const dir = path.join(process.cwd(), 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, path.basename(file) + '.' + ts);
  fs.copyFileSync(file, target);
  return target;
}

function upgradeComponent(name, opts) {
  const compDir = path.join(process.cwd(), 'components');
  const tmplDir = path.join(process.cwd(), 'templates');
  const file = path.join(compDir, `${name}.js`);
  if (!fs.existsSync(file)) {
    console.error(`Component ${name} not found`);
    return;
  }
  const current = fs.readFileSync(file, 'utf8');
  const header = parseHeader(current);
  if (!header.version) {
    console.error(`No version header in ${file}`);
    return;
  }
  const basePath = path.join(tmplDir, name, header.version, `${name}.js`);
  const incomingPath = path.join(tmplDir, name, 'latest', `${name}.js`);
  if (!fs.existsSync(basePath) || !fs.existsSync(incomingPath)) {
    console.error(`Template missing for ${name}`);
    return;
  }
  const base = fs.readFileSync(basePath, 'utf8');
  const incoming = fs.readFileSync(incomingPath, 'utf8');
  const { text, conflict } = mergeFiles(current, base, incoming);
  if (opts.check) {
    console.log(`${name}: ${header.version} -> latest${conflict ? ' (conflict)' : ''}`);
    return;
  }
  if (opts.diff) {
    const tmp = text.split('\n');
    const orig = current.split('\n');
    const diff = require('diff').createPatch(file, current, text);
    console.log(diff);
  }
  if (!opts.dry) {
    const bak = backupFile(file);
    fs.writeFileSync(file, text, 'utf8');
    console.log(`Upgraded ${name} (backup ${bak})${conflict ? ' with conflicts' : ''}`);
  }
}

function run() {
  const args = minimist(process.argv.slice(2), {
    boolean: ['check', 'dry', 'diff'],
    string: ['rollback'],
  });
  if (args.rollback) {
    const dir = path.join(process.cwd(), 'backups');
    const backups = fs.readdirSync(dir).filter(f => f.startsWith(args.rollback));
    if (backups.length === 0) {
      console.error('No backup found');
      return;
    }
    const latest = backups.sort().pop();
    fs.copyFileSync(path.join(dir, latest), path.join(process.cwd(), 'components', `${args.rollback}.js`));
    console.log(`Rolled back ${args.rollback} from ${latest}`);
    return;
  }
  const components = args._.length ? args._ : fs.readdirSync(path.join(process.cwd(), 'components')).map(f => path.basename(f, '.js'));
  components.forEach(c => upgradeComponent(c, args));
}

run();
