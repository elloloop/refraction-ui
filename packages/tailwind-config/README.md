# @refraction-ui/tailwind-config

Tailwind CSS preset for Refraction UI. Part of [Refraction UI](https://elloloop.github.io/refraction-ui/).

## Install

```bash
pnpm add -D @refraction-ui/tailwind-config
```

## Usage

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'
import { refractionPreset } from '@refraction-ui/tailwind-config'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  presets: [refractionPreset],
} satisfies Config
```

## License

MIT
