import { execFileSync } from 'node:child_process'

// Linux references use Ubuntu 24.04's packaged fonts, not downloaded web fonts.
// The browser image alone omits fonts installed on the hosted runner by other tools.
const packages = {
  'fonts-dejavu-core': '2.37-8',
  'fonts-dejavu-extra': '2.37-8',
  'fonts-lato': '2.015-1',
}
const families = { 'system-ui': 'DejaVu Sans', Lato: 'Lato' }

export function checkVisualFonts() {
  if (process.platform !== 'linux') return

  try {
    for (const [name, expected] of Object.entries(packages)) {
      const actual = execFileSync('dpkg-query', ['-W', '-f=${Version}', name], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }).trim()
      if (actual !== expected) throw new Error(`${name}: expected ${expected}, found ${actual}`)
    }
    for (const [query, expected] of Object.entries(families)) {
      const actual = execFileSync('fc-match', ['-f', '%{family}', query], {
        encoding: 'utf8',
      }).trim()
      if (actual !== expected) throw new Error(`${query}: expected ${expected}, found ${actual}`)
    }
  } catch (cause) {
    throw new Error(
      'Visual references require the Ubuntu 24.04 font environment. Install ' +
      Object.entries(packages).map(([name, version]) => `${name}=${version}`).join(' ') +
      ' before running Playwright or Lost Pixel. Do not refresh references using fallback fonts.',
      { cause },
    )
  }
}
