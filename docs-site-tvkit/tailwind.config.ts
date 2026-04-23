import type { Config } from 'tailwindcss'
import { refractionPreset } from '@refraction-ui/tailwind-config'

const config: Config = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  presets: [refractionPreset as any],
  content: [
    './src/**/*.{ts,tsx}',
    // Scan built package dist files for Tailwind utility classes used in cva styles
    '../packages/*/dist/*.js',
    '../packages/react-*/dist/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
