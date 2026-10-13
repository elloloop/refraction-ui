import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runCanary } from './canary-release.mjs';

const publisher = fileURLToPath(new URL('./publish-oidc.mjs', import.meta.url));

function fixture(mode) {
  const root = mkdtempSync(path.join(tmpdir(), 'refraction-release-test-'));
  const bin = path.join(root, 'bin'); mkdirSync(bin); mkdirSync(path.join(root, 'pkg'));
  const source = `#!${process.execPath}
const fs=require('node:fs'),path=require('node:path');
const cmd=path.basename(process.argv[1]),args=process.argv.slice(2),root=process.env.RELEASE_TEST_ROOT,mode=process.env.RELEASE_TEST_MODE;
fs.appendFileSync(path.join(root,'calls.jsonl'),JSON.stringify({cmd,args})+'\\n');
if(cmd==='pnpm'){console.log(JSON.stringify([{name:mode==='unexpected'?'evil;exit 0':'@refraction-ui/react',version:mode==='canary'?'0.24.0-canary.1':mode==='metadata'?'0.24.0-rc.1+build.2':mode==='redos'?'0.0.0+'+'--'.repeat(10000)+'!':'0.24.0',path:path.join(root,'pkg'),private:false}]));}
else if(cmd==='curl'){
 if(mode==='oidc-fail'){console.error('FAKE_GITHUB_SECRET');process.exit(7);}
 console.log(args.includes('-X')?JSON.stringify({token:'FAKE_NPM_SECRET'}):JSON.stringify({value:'FAKE_GITHUB_SECRET'}));
}
else if(cmd==='npm'){
 if(args[0]==='info'){
  if(mode==='registry-fail'){console.log(JSON.stringify({error:{code:'E503'}}));process.exit(1);}
  if(mode==='first-version'){console.log(JSON.stringify({error:{code:'E404'}}));process.exit(1);}
  console.log(JSON.stringify(args[2]==='versions'?(mode.startsWith('existing')?['0.24.0']:['0.23.2']):{latest:mode==='existing-current'?'0.24.0':'0.23.2'}));
 }else if(args[0]==='publish'){
  const config=args[args.indexOf('--userconfig')+1];
  fs.writeFileSync(path.join(root,'config-mode'),String(fs.statSync(config).mode&0o777));
  if(mode==='publish-fail'){console.error('publication refused');process.exit(1);}
 }else if(args[0]==='dist-tag'&&mode==='existing-tag-fail'){process.exit(1);}
}else if(cmd==='git'&&mode==='tag-fail'){process.exit(1);}
`;
  for (const command of ['pnpm', 'npm', 'curl', 'git']) writeFileSync(path.join(bin, command), source, { mode: 0o755 });
  const result = spawnSync(process.execPath, [publisher, ...(mode === 'canary' ? ['--canary'] : [])], {
    cwd: root, encoding: 'utf8', timeout: 5000, env: {
      PATH: bin + path.delimiter + process.env.PATH,
      RELEASE_TEST_ROOT: root, RELEASE_TEST_MODE: mode,
      ACTIONS_ID_TOKEN_REQUEST_URL: 'https://oidc.actions.githubusercontent.com/?request=fixture',
      ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'FAKE_REQUEST_SECRET',
    },
  });
  const calls = existsSync(path.join(root, 'calls.jsonl')) ? readFileSync(path.join(root, 'calls.jsonl'), 'utf8').trim().split('\n').map(JSON.parse) : [];
  const proof = { ...result, calls, removedConfig: !existsSync(path.join(root, '.npmrc.tmp')), mode: existsSync(path.join(root, 'config-mode')) ? readFileSync(path.join(root, 'config-mode'), 'utf8') : null };
  rmSync(root, { recursive: true, force: true }); return proof;
}

test('empty and private-only plans never invoke versioning or publication', () => {
  for (const releases of [[], [{ name: '@refraction-ui/shared', type: 'patch' }], [{ name: '@refraction-ui/react', type: 'none' }]]) {
    assert.equal(runCanary({ releases }, () => assert.fail('must not invoke a process')), false);
  }
});
test('public canary plans version first and preserve the trusted publisher', () => {
  const calls = []; assert.equal(runCanary({ releases: [{ name: '@refraction-ui/react', type: 'patch' }] }, (...args) => calls.push(args)), true);
  assert.deepEqual(calls[0].slice(0, 2), ['pnpm', ['exec', 'changeset', 'version', '--snapshot', 'canary']]);
  assert.deepEqual(calls[1].slice(0, 2), [process.execPath, ['scripts/publish-oidc.mjs', '--canary']]);
});
test('snapshot failure propagates and never starts publication', () => {
  let calls = 0; assert.throws(() => runCanary({ releases: [{ name: '@refraction-ui/astro', type: 'minor' }] }, () => { calls++; throw Error('snapshot failed'); }), /snapshot failed/); assert.equal(calls, 1);
});
test('successful publication keeps provenance, creates its tag and signals Changesets', () => {
  const r = fixture('success'); assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /New tag: @refraction-ui\/react@0\.24\.0/);
  const publish = r.calls.find(c => c.cmd === 'npm' && c.args[0] === 'publish'); assert.ok(publish.args.includes('--provenance')); assert.ok(publish.args.includes('latest'));
  assert.deepEqual(r.calls.find(c => c.cmd === 'git').args, ['tag', '@refraction-ui/react@0.24.0']); assert.equal(r.mode, '384'); assert.ok(r.removedConfig);
});
test('canary retains its separate tag and version marker', () => {
  const r = fixture('canary'); assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /New tag: @refraction-ui\/react@0\.24\.0-canary\.1/); assert.ok(r.calls.find(c => c.cmd === 'npm' && c.args[0] === 'publish').args.includes('canary'));
});
test('an explicit E404 permits first publication', () => { const r = fixture('first-version'); assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /New tag:/); });
test('registry outages fail closed before publication', () => {
  const r = fixture('registry-fail'); assert.notEqual(r.status, 0); assert.ok(!r.calls.some(c => c.cmd === 'npm' && c.args[0] === 'publish')); assert.doesNotMatch(r.stdout, /New tag:/);
});
test('existing identical latest version is skipped without creating a release tag', () => {
  const r = fixture('existing-current'); assert.equal(r.status, 0, r.stderr); assert.ok(!r.calls.some(c => c.cmd === 'git')); assert.doesNotMatch(r.stdout, /New tag:/);
});
test('failed dist-tag repair is a failed workflow', () => { const r = fixture('existing-tag-fail'); assert.notEqual(r.status, 0); assert.doesNotMatch(r.stdout, /New tag:/); });
test('failed npm publish propagates and removes its credential file', () => {
  const r = fixture('publish-fail'); assert.notEqual(r.status, 0); assert.ok(r.removedConfig); assert.equal(r.mode, '384'); assert.ok(!r.calls.some(c => c.cmd === 'git')); assert.doesNotMatch(r.stdout, /New tag:/);
});
test('failed release-tag creation cannot report a successful release', () => { const r = fixture('tag-fail'); assert.notEqual(r.status, 0); assert.doesNotMatch(r.stdout, /New tag:/); assert.ok(r.removedConfig); });
test('OIDC errors do not expose Authorization values', () => {
  const r = fixture('oidc-fail'); assert.notEqual(r.status, 0); assert.doesNotMatch(r.stdout + r.stderr, /FAKE_(GITHUB|REQUEST|NPM)_SECRET/);
});
test('unexpected public package names are rejected before any credential exchange', () => {
  const r = fixture('unexpected'); assert.notEqual(r.status, 0); assert.ok(!r.calls.some(c => c.cmd === 'curl')); assert.ok(!r.calls.some(c => c.cmd === 'npm'));
});

test('long malformed versions terminate before exchanging credentials', () => {
  const r = fixture('redos'); assert.equal(r.error, undefined); assert.equal(r.status, 1);
  assert.ok(!r.calls.some(c => c.cmd === 'curl' || c.cmd === 'npm'));
});
test('ordinary prerelease and build metadata versions remain supported', () => {
  const r = fixture('metadata'); assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /New tag: @refraction-ui\/react@0\.24\.0-rc\.1\+build\.2/);
});
