import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

async function publish() {
  const isCanary = process.argv.includes('--canary');
  console.log(`📦 Starting OIDC publish (${isCanary ? 'Canary' : 'Latest'})...`);

  // 1. Find all public packages in the workspace
  const packagesStr = execSync('pnpm ls -r --depth -1 --json').toString();
  const allPackages = JSON.parse(packagesStr);
  const publicPackages = allPackages.filter(pkg => !pkg.private);

  if (publicPackages.length === 0) {
    console.log('✅ No public packages found.');
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

  // 3. Check and publish each package
  for (const pkg of publicPackages) {
    const pkgName = pkg.name;
    const pkgVersion = pkg.version;
    const pkgPath = pkg.path;

    console.log(`\n🔍 Checking ${pkgName}@${pkgVersion}...`);
    
    // Check if version is already published
    let isPublished = false;
    try {
      const publishedVersionsStr = execSync(`npm info ${pkgName} versions --json`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
      const publishedVersions = JSON.parse(publishedVersionsStr);
      if (publishedVersions.includes(pkgVersion)) {
        isPublished = true;
      }
    } catch (err) {
      // 404 means the package has never been published before
      console.log(`ℹ️  ${pkgName} not found on npm. Publishing first version.`);
    }

    if (isPublished) {
      console.log(`⏭️  ${pkgName}@${pkgVersion} is already published. Skipping.`);
      continue;
    }

    console.log(`🔐 Fetching npm token for ${pkgName}...`);
    const encodedPkg = pkgName.replace('@', '%40').replace('/', '%2f');
    
    try {
      const npmResponse = execSync(`curl -sS -f -X POST "https://registry.npmjs.org/-/npm/v1/oidc/token/exchange/package/${encodedPkg}" -H "Authorization: Bearer ${githubOidcToken}"`).toString();
      const npmToken = JSON.parse(npmResponse).token;

      // Create a temporary .npmrc for this specific package publish
      const npmrcPath = path.join(process.cwd(), '.npmrc.tmp');
      fs.writeFileSync(npmrcPath, `//registry.npmjs.org/:_authToken=${npmToken}\n`);

      console.log(`🚀 Publishing ${pkgName}@${pkgVersion}...`);
      
      const tag = isCanary ? 'canary' : 'latest';
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
