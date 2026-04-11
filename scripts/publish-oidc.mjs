import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

async function publish() {
  const isCanary = process.argv.includes('--canary');
  console.log(`📦 Starting OIDC publish (${isCanary ? 'Canary' : 'Latest'})...`);

  // 1. Get the list of packages to publish
  // We use changeset status to find what has changed
  const statusOutput = execSync('pnpm exec changeset status --output status.json').toString();
  const status = JSON.parse(fs.readFileSync('status.json', 'utf8'));
  const packagesToPublish = status.releases;

  if (packagesToPublish.length === 0) {
    console.log('✅ No packages need publishing.');
    return;
  }

  // 2. Get the base OIDC token from the environment
  const idTokenUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const idToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;

  if (!idTokenUrl || !idToken) {
    throw new Error('Missing GITHUB_ACTIONS OIDC environment variables.');
  }

  const oidcResponse = execSync(`curl -sS -f "${idTokenUrl}&audience=npm:registry.npmjs.org" -H "Authorization: Bearer ${idToken}"`).toString();
  const githubOidcToken = JSON.parse(oidcResponse).value;

  // 3. Publish each package with its own token
  for (const release of packagesToPublish) {
    const pkgName = release.name;
    const pkgPath = release.dir; // Note: changesets status provides the directory
    
    console.log(`🔐 Fetching npm token for ${pkgName}...`);
    const encodedPkg = pkgName.replace('@', '%40').replace('/', '%2f');
    
    try {
      const npmResponse = execSync(`curl -sS -f -X POST "https://registry.npmjs.org/-/npm/v1/oidc/token/exchange/package/${encodedPkg}" -H "Authorization: Bearer ${githubOidcToken}"`).toString();
      const npmToken = JSON.parse(npmResponse).token;

      // Create a temporary .npmrc for this specific package publish
      const npmrcPath = path.join(process.cwd(), '.npmrc.tmp');
      fs.writeFileSync(npmrcPath, `//registry.npmjs.org/:_authToken=${npmToken}\n`);

      console.log(`🚀 Publishing ${pkgName}@${release.newVersion}...`);
      
      const tag = isCanary ? 'canary' : 'latest';
      // We run publish inside the package directory
      execSync(`npm publish --userconfig ${npmrcPath} --tag ${tag} --access public --provenance`, {
        cwd: pkgPath,
        stdio: 'inherit'
      });
      
      console.log(`✅ Successfully published ${pkgName}`);
      fs.unlinkSync(npmrcPath);
    } catch (err) {
      console.error(`❌ Failed to publish ${pkgName}:`, err.message);
      // We continue to other packages even if one fails
    }
  }
}

publish().catch(err => {
  console.error(err);
  process.exit(1);
});
