import getReleasePlan from '@changesets/get-release-plan';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const publicNames = new Set(['@refraction-ui/react', '@refraction-ui/astro', '@refraction-ui/tailwind-config']);

export function runCanary(plan, run = execFileSync) {
  if (!plan.releases.some(release => publicNames.has(release.name) && release.type !== 'none')) {
    console.log('No pending public releases; skipping canary without changing versions.');
    return false;
  }
  run('pnpm', ['exec', 'changeset', 'version', '--snapshot', 'canary'], { stdio: 'inherit' });
  run(process.execPath, ['scripts/publish-oidc.mjs', '--canary'], { stdio: 'inherit' });
  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const plan = await getReleasePlan(process.cwd());
  runCanary(plan);
}
