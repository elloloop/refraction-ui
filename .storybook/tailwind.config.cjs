const { refractionPreset } = require('@refraction-ui/tailwind-config')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './.storybook/**/*.{ts,tsx}',
    './packages/*/src/**/*.{ts,tsx,astro}',
    './docs-site/src/**/*.{ts,tsx}',
  ],
  presets: [refractionPreset],
}
