import { execSync, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function getPackageNpmToken(pkgName, githubOidcToken) {
  const encodedPkg = pkgName.replace('@', '%40').replace('/', '%2f');
  try {
    const npmResponse = execFileSync('curl', ['-sS', '-f', '-X', 'POST',
      `https://registry.npmjs.org/-/npm/v1/oidc/token/exchange/package/${encodedPkg}`,
      '-H', `Authorization: Bearer ${githubOidcToken}`], { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
    const token = JSON.parse(npmResponse).token;
    if (typeof token !== 'string' || !token) throw new Error('Empty token');
    return token;
  } catch {
    // Child-process errors can include the complete Authorization argument.
    throw new Error(`npm OIDC exchange failed for ${pkgName}`);
  }
}

function withPackageNpmrc(npmToken, callback) {
  const npmrcPath = path.join(process.cwd(), '.npmrc.tmp');
  fs.writeFileSync(npmrcPath, `//registry.npmjs.org/:_authToken=${npmToken}\n`, { mode: 0o600, flag: 'wx' });

  try {
    callback(npmrcPath);
  } finally {
    fs.rmSync(npmrcPath, { force: true });
  }
}

async function publish() {
  const isCanary = process.argv.includes('--canary');
  const tag = isCanary ? 'canary' : 'latest';
  console.log(`📦 Starting OIDC publish (${isCanary ? 'Canary' : 'Latest'})...`);

  // 1. Find all public packages in the workspace
  const packagesStr = execSync('pnpm ls -r --depth -1 --json').toString();
  const allPackages = JSON.parse(packagesStr);
  const publicPackages = allPackages.filter(pkg => !pkg.private);
  const allowed = new Set(['@refraction-ui/react', '@refraction-ui/astro', '@refraction-ui/tailwind-config']);
  for (const pkg of publicPackages) {
    if (!allowed.has(pkg.name) || typeof pkg.version !== 'string' || pkg.version.length > 256 ||
        pkg.version.trim() !== pkg.version ||
        !/^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(pkg.version)) {
      throw new Error('Unexpected public package or version; review the publisher allowlist');
    }
  }
  const failures = [];

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

  let githubOidcToken;
  try {
    const url = new URL(idTokenUrl);
    url.searchParams.set('audience', 'npm:registry.npmjs.org');
    const oidcResponse = execFileSync('curl', ['-sS', '-f', url.toString(), '-H',
      `Authorization: Bearer ${idToken}`], { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
    githubOidcToken = JSON.parse(oidcResponse).value;
    if (typeof githubOidcToken !== 'string' || !githubOidcToken) throw new Error('Empty token');
  } catch {
    throw new Error('GitHub OIDC exchange failed');
  }

  // 3. Check and publish each package
  for (const pkg of publicPackages) {
    const pkgName = pkg.name;
    const pkgVersion = pkg.version;
    const pkgPath = pkg.path;

    console.log(`\n🔍 Checking ${pkgName}@${pkgVersion}...`);

    if (isCanary && !pkgVersion.includes('canary')) {
      console.log(`⏭️  ${pkgName}@${pkgVersion} is not a canary version. Skipping canary publish.`);
      continue;
    }
    
    // Check if version is already published
    let isPublished = false;
    let distTags = {};
    try {
      const publishedVersionsStr = execSync(`npm info ${pkgName} versions --json`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
      const publishedVersions = JSON.parse(publishedVersionsStr);
      if (publishedVersions.includes(pkgVersion)) {
        isPublished = true;
      }

      const distTagsStr = execSync(`npm info ${pkgName} dist-tags --json`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
      distTags = JSON.parse(distTagsStr);
    } catch (err) {
      // Only an explicit registry E404 allows publishing a first version.
      const diagnostic = `${err.stdout ?? ''}\n${err.stderr ?? ''}`;
      if (!diagnostic.includes('E404')) throw new Error(`Registry lookup failed for ${pkgName}`);
      console.log(`ℹ️  ${pkgName} not found on npm. Publishing first version.`);
    }

    if (isPublished) {
      if (distTags[tag] === pkgVersion) {
        console.log(`⏭️  ${pkgName}@${pkgVersion} is already published with tag ${tag}. Skipping.`);
        continue;
      }

      console.log(`🏷️  ${pkgName}@${pkgVersion} is already published. Moving ${tag} tag from ${distTags[tag] ?? 'unset'} to ${pkgVersion}.`);

      try {
        const npmToken = getPackageNpmToken(pkgName, githubOidcToken);

        withPackageNpmrc(npmToken, npmrcPath => {
          execSync(`npm dist-tag add ${pkgName}@${pkgVersion} ${tag} --userconfig ${npmrcPath}`, {
            stdio: 'inherit'
          });
        });

        console.log(`✅ Successfully tagged ${pkgName}@${pkgVersion} as ${tag}`);
      } catch {
        console.error(`❌ Failed to tag ${pkgName}@${pkgVersion} as ${tag}`);
        failures.push(`${pkgName}: dist-tag update`);
      }
      continue;
    }

    console.log(`🔐 Fetching npm token for ${pkgName}...`);
    
    try {
      const npmToken = getPackageNpmToken(pkgName, githubOidcToken);

      console.log(`🚀 Publishing ${pkgName}@${pkgVersion}...`);
      
      withPackageNpmrc(npmToken, npmrcPath => {
        execSync(`npm publish --userconfig ${npmrcPath} --tag ${tag} --access public --provenance`, {
          cwd: pkgPath,
          stdio: 'inherit'
        });
      });
      
      // Changesets/action discovers successful releases from this exact marker
      // and pushes the corresponding tag. Create it only after npm succeeds.
      const releaseTag = `${pkgName}@${pkgVersion}`;
      execFileSync('git', ['tag', releaseTag], { stdio: ['ignore', 'pipe', 'pipe'] });
      console.log(`New tag: ${releaseTag}`);
      console.log(`✅ Successfully published ${pkgName}`);
    } catch {
      console.error(`❌ Failed to publish ${pkgName}`);
      failures.push(`${pkgName}: publication or release tag`);
    }
  }
  if (failures.length) throw new Error(`Release failed: ${failures.join(', ')}`);
}

publish().catch(err => {
  console.error(err);
  process.exit(1);
});
