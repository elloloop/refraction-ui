// Complete theme configurations for each example website.
// Every config includes the full set of CSS custom properties
// so each example can be independently themed.

export const teamspaceConfig = `:root {
  /* Colors — deep blue */
  --background: 0 0% 100%;
  --foreground: 213 13% 16%;
  --card: 0 0% 100%;
  --card-foreground: 213 13% 16%;
  --popover: 0 0% 100%;
  --popover-foreground: 213 13% 16%;
  --primary: 220 72% 50%;
  --primary-foreground: 0 0% 100%;
  --secondary: 220 5% 96%;
  --secondary-foreground: 213 13% 40%;
  --accent: 220 40% 95%;
  --accent-foreground: 220 72% 35%;
  --muted: 220 14% 96%;
  --muted-foreground: 220 9% 46%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --success: 154 64% 40%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 213 13% 16%;
  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 220 72% 50%;
  --chart-1: 220 72% 50%;
  --chart-2: 154 64% 40%;
  --chart-3: 38 92% 50%;
  --chart-4: 198 80% 45%;
  --chart-5: 340 65% 50%;

  /* Sidebar — deep navy */
  --sidebar-background: 220 40% 18%;
  --sidebar-foreground: 220 20% 85%;
  --sidebar-primary: 0 0% 100%;
  --sidebar-primary-foreground: 220 40% 18%;
  --sidebar-accent: 220 30% 25%;
  --sidebar-accent-foreground: 0 0% 100%;
  --sidebar-border: 220 25% 25%;
  --sidebar-ring: 220 72% 50%;

  /* Typography */
  --font-sans: 'Lato', system-ui, sans-serif;
  --font-heading: 'Lato', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Shadows */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  --shadow-md: 0 2px 4px -1px rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.03);
  --shadow-lg: 0 6px 10px -2px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03);
  --shadow-xl: 0 12px 20px -4px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.03);

  /* Glass & overlay */
  --overlay-opacity: 0.5;
  --backdrop-blur: 8px;
  --glass-bg: rgba(252, 252, 253, 0.8);
  --glass-border: rgba(255, 255, 255, 0.15);

  /* Spacing & density — compact */
  --spacing-scale: 0.9;
  --container-max-width: 1280px;
  --container-padding: 1.5rem;
  --card-padding: 1.25rem;
  --input-height: 2.25rem;
  --button-height: 2rem;
  --section-gap: 3rem;

  /* Typography tokens */
  --letter-spacing-tighter: -0.04em;
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
  --letter-spacing-wider: 0.05em;
  --line-height-tight: 1.3;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;
  --heading-weight: 700;
  --heading-letter-spacing: -0.02em;
  --heading-line-height: 1.2;

  /* Shape — functional, compact */
  --radius: 0.375rem;
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
  --avatar-radius: 0.375rem;
  --badge-radius: 9999px;
  --button-radius: 0.375rem;
  --input-radius: 0.375rem;
  --card-radius: 0.5rem;
  --tooltip-radius: 0.375rem;

  /* Component shadows */
  --card-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  --dropdown-shadow: 0 6px 10px -2px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03);
  --dialog-shadow: 0 12px 20px -4px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.03);
  --button-shadow: none;

  /* Borders & dividers */
  --border-width: 1px;
  --border-style: solid;
  --divider-style: solid;
  --divider-opacity: 0.15;

  /* Inputs */
  --input-style: bordered;
  --input-border-on-focus: 0;
  --placeholder-opacity: 0.5;

  /* Buttons */
  --button-style: filled;
  --button-weight: 500;
  --hover-effect: darken;
  --active-effect: scale-down;
  --disabled-opacity: 0.5;

  /* Links */
  --link-style: color-only;
  --link-weight: inherit;

  /* Focus */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-style: ring;

  /* Icons */
  --icon-style: outlined;
  --icon-stroke-width: 1.5;
  --icon-size: 1.25rem;

  /* Scrollbar */
  --scrollbar-style: thin;
  --scrollbar-track: transparent;
  --scrollbar-thumb: rgba(0, 0, 0, 0.15);

  /* Selection */
  --selection-background: 220 72% 50%;
  --selection-foreground: 0 0% 100%;

  /* Tooltips */
  --tooltip-style: dark;

  /* Tables */
  --table-style: clean;
  --table-header-weight: 600;

  /* Loading */
  --spinner-style: circle;

  /* Motion */
  --transition-duration: 150ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-speed: fast;
  --hover-transition: 150ms ease;
  --enter-transition: 200ms ease-out;
  --exit-transition: 150ms ease-in;
}`

export const cortexConfig = `:root {
  /* Colors — warm amber */
  --background: 0 0% 100%;
  --foreground: 210 11% 15%;
  --card: 0 0% 100%;
  --card-foreground: 210 11% 15%;
  --popover: 0 0% 100%;
  --popover-foreground: 210 11% 15%;
  --primary: 35 92% 50%;
  --primary-foreground: 0 0% 100%;
  --secondary: 35 10% 96%;
  --secondary-foreground: 35 5% 40%;
  --accent: 35 50% 94%;
  --accent-foreground: 35 92% 35%;
  --muted: 35 10% 96%;
  --muted-foreground: 210 8% 50%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --success: 160 84% 39%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 210 11% 15%;
  --border: 210 14% 92%;
  --input: 210 14% 92%;
  --ring: 160 84% 39%;
  --chart-1: 160 84% 39%;
  --chart-2: 200 80% 45%;
  --chart-3: 38 92% 50%;
  --chart-4: 280 60% 50%;
  --chart-5: 340 65% 50%;

  /* Sidebar — dark */
  --sidebar-background: 210 15% 7%;
  --sidebar-foreground: 210 10% 80%;
  --sidebar-primary: 160 84% 50%;
  --sidebar-primary-foreground: 210 15% 7%;
  --sidebar-accent: 210 12% 14%;
  --sidebar-accent-foreground: 0 0% 100%;
  --sidebar-border: 210 10% 14%;
  --sidebar-ring: 160 84% 39%;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Shadows */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  --shadow-md: 0 2px 4px -1px rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.03);
  --shadow-lg: 0 6px 10px -2px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03);
  --shadow-xl: 0 12px 20px -4px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.03);

  /* Glass & overlay */
  --overlay-opacity: 0.5;
  --backdrop-blur: 8px;
  --glass-bg: rgba(252, 252, 253, 0.8);
  --glass-border: rgba(255, 255, 255, 0.15);

  /* Spacing & density — spacious */
  --spacing-scale: 1.1;
  --container-max-width: 1280px;
  --container-padding: 2rem;
  --card-padding: 1.5rem;
  --input-height: 2.75rem;
  --button-height: 2.5rem;
  --section-gap: 5rem;

  /* Typography tokens */
  --letter-spacing-tighter: -0.04em;
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
  --letter-spacing-wider: 0.05em;
  --line-height-tight: 1.3;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;
  --heading-weight: 700;
  --heading-letter-spacing: -0.02em;
  --heading-line-height: 1.2;

  /* Shape — rounded, modern */
  --radius: 0.75rem;
  --radius-none: 0;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.25rem;
  --radius-full: 9999px;
  --avatar-radius: 9999px;
  --badge-radius: 9999px;
  --button-radius: 0.75rem;
  --input-radius: 0.75rem;
  --card-radius: 0.75rem;
  --tooltip-radius: 0.5rem;

  /* Component shadows */
  --card-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.04);
  --dropdown-shadow: 0 6px 12px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.03);
  --dialog-shadow: 0 12px 24px -4px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.04);
  --button-shadow: none;

  /* Borders & dividers */
  --border-width: 1px;
  --border-style: solid;
  --divider-style: solid;
  --divider-opacity: 0.12;

  /* Inputs */
  --input-style: bordered;
  --input-border-on-focus: 0;
  --placeholder-opacity: 0.45;

  /* Buttons */
  --button-style: filled;
  --button-weight: 500;
  --hover-effect: darken;
  --active-effect: scale-down;
  --disabled-opacity: 0.5;

  /* Links */
  --link-style: color-only;
  --link-weight: inherit;

  /* Focus */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-style: ring;

  /* Icons */
  --icon-style: outlined;
  --icon-stroke-width: 1.5;
  --icon-size: 1.25rem;

  /* Scrollbar */
  --scrollbar-style: thin;
  --scrollbar-track: transparent;
  --scrollbar-thumb: rgba(0, 0, 0, 0.12);

  /* Selection */
  --selection-background: 160 84% 39%;
  --selection-foreground: 0 0% 100%;

  /* Tooltips */
  --tooltip-style: dark;

  /* Tables */
  --table-style: clean;
  --table-header-weight: 600;

  /* Loading */
  --spinner-style: circle;

  /* Motion */
  --transition-duration: 150ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-speed: fast;
  --hover-transition: 150ms ease;
  --enter-transition: 200ms ease-out;
  --exit-transition: 150ms ease-in;
}`

export const momentoConfig = `:root {
  /* Colors — sunset orange */
  --background: 0 0% 100%;
  --foreground: 0 0% 10%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 10%;
  --primary: 24 90% 55%;
  --primary-foreground: 0 0% 100%;
  --secondary: 24 10% 96%;
  --secondary-foreground: 0 0% 40%;
  --accent: 24 50% 95%;
  --accent-foreground: 24 90% 40%;
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 45%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 71% 40%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 10%;
  --border: 0 0% 90%;
  --input: 0 0% 90%;
  --ring: 340 82% 52%;
  --chart-1: 340 82% 52%;
  --chart-2: 25 95% 55%;
  --chart-3: 280 60% 55%;
  --chart-4: 200 70% 50%;
  --chart-5: 160 60% 45%;

  /* Sidebar */
  --sidebar-background: 0 0% 100%;
  --sidebar-foreground: 0 0% 10%;
  --sidebar-primary: 340 82% 52%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 340 50% 95%;
  --sidebar-accent-foreground: 340 82% 42%;
  --sidebar-border: 0 0% 90%;
  --sidebar-ring: 340 82% 52%;

  /* Typography */
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-heading: system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, monospace;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Shadows */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --shadow-md: 0 2px 6px -1px rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.03);
  --shadow-lg: 0 8px 16px -3px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.03);
  --shadow-xl: 0 16px 28px -6px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.04);

  /* Glass & overlay */
  --overlay-opacity: 0.5;
  --backdrop-blur: 10px;
  --glass-bg: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(255, 255, 255, 0.2);

  /* Spacing & density — playful */
  --spacing-scale: 1;
  --container-max-width: 1280px;
  --container-padding: 2rem;
  --card-padding: 1rem;
  --input-height: 2.5rem;
  --button-height: 2.25rem;
  --section-gap: 4rem;

  /* Typography tokens */
  --letter-spacing-tighter: -0.03em;
  --letter-spacing-tight: -0.015em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
  --letter-spacing-wider: 0.05em;
  --line-height-tight: 1.3;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;
  --heading-weight: 700;
  --heading-letter-spacing: -0.015em;
  --heading-line-height: 1.2;

  /* Shape — rounded, playful */
  --radius: 0.5rem;
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.25rem;
  --radius-full: 9999px;
  --avatar-radius: 9999px;
  --badge-radius: 9999px;
  --button-radius: 0.5rem;
  --input-radius: 0.5rem;
  --card-radius: 0.5rem;
  --tooltip-radius: 0.375rem;

  /* Component shadows */
  --card-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.04);
  --dropdown-shadow: 0 8px 16px -3px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.03);
  --dialog-shadow: 0 16px 28px -6px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.04);
  --button-shadow: none;

  /* Borders & dividers */
  --border-width: 1px;
  --border-style: solid;
  --divider-style: solid;
  --divider-opacity: 0.1;

  /* Inputs */
  --input-style: bordered;
  --input-border-on-focus: 0;
  --placeholder-opacity: 0.45;

  /* Buttons */
  --button-style: filled;
  --button-weight: 600;
  --hover-effect: darken;
  --active-effect: scale-down;
  --disabled-opacity: 0.5;

  /* Links */
  --link-style: color-only;
  --link-weight: 600;

  /* Focus */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-style: ring;

  /* Icons */
  --icon-style: outlined;
  --icon-stroke-width: 1.5;
  --icon-size: 1.25rem;

  /* Scrollbar */
  --scrollbar-style: thin;
  --scrollbar-track: transparent;
  --scrollbar-thumb: rgba(0, 0, 0, 0.1);

  /* Selection */
  --selection-background: 340 82% 52%;
  --selection-foreground: 0 0% 100%;

  /* Tooltips */
  --tooltip-style: dark;

  /* Tables */
  --table-style: clean;
  --table-header-weight: 600;

  /* Loading */
  --spinner-style: circle;

  /* Motion */
  --transition-duration: 200ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-speed: fast;
  --hover-transition: 200ms ease;
  --enter-transition: 250ms ease-out;
  --exit-transition: 200ms ease-in;
}`

export const grandviewConfig = `:root {
  /* Colors — warm gold hospitality */
  --background: 30 50% 99%;
  --foreground: 30 10% 12%;
  --card: 30 30% 99%;
  --card-foreground: 30 10% 12%;
  --popover: 0 0% 100%;
  --popover-foreground: 30 10% 12%;
  --primary: 35 85% 45%;
  --primary-foreground: 0 0% 100%;
  --secondary: 30 15% 95%;
  --secondary-foreground: 30 10% 40%;
  --accent: 35 40% 93%;
  --accent-foreground: 35 85% 35%;
  --muted: 30 15% 95%;
  --muted-foreground: 30 8% 45%;
  --destructive: 0 70% 50%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 60% 38%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 30 10% 12%;
  --border: 30 12% 90%;
  --input: 30 12% 90%;
  --ring: 35 85% 45%;
  --chart-1: 35 85% 45%;
  --chart-2: 160 50% 40%;
  --chart-3: 200 60% 45%;
  --chart-4: 330 50% 50%;
  --chart-5: 280 40% 50%;

  /* Sidebar */
  --sidebar-background: 30 20% 97%;
  --sidebar-foreground: 30 10% 12%;
  --sidebar-primary: 35 85% 45%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 35 40% 93%;
  --sidebar-accent-foreground: 35 85% 35%;
  --sidebar-border: 30 12% 90%;
  --sidebar-ring: 35 85% 45%;

  /* Typography */
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --font-heading: 'DM Serif Display', Georgia, serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Shadows */
  --shadow-none: none;
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.04);
  --shadow-md: 0 3px 6px -1px rgb(0 0 0 / 0.05), 0 1px 3px -1px rgb(0 0 0 / 0.03);
  --shadow-lg: 0 8px 16px -3px rgb(0 0 0 / 0.06), 0 3px 6px -3px rgb(0 0 0 / 0.03);
  --shadow-xl: 0 14px 24px -5px rgb(0 0 0 / 0.07), 0 5px 8px -5px rgb(0 0 0 / 0.03);

  /* Glass & overlay */
  --overlay-opacity: 0.5;
  --backdrop-blur: 10px;
  --glass-bg: rgba(255, 252, 248, 0.85);
  --glass-border: rgba(255, 255, 255, 0.2);

  /* Spacing & density — spacious, elegant */
  --spacing-scale: 1.1;
  --container-max-width: 1200px;
  --container-padding: 2rem;
  --card-padding: 1.75rem;
  --input-height: 2.75rem;
  --button-height: 2.5rem;
  --section-gap: 5rem;

  /* Typography tokens */
  --letter-spacing-tighter: -0.04em;
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
  --letter-spacing-wider: 0.05em;
  --line-height-tight: 1.3;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  --heading-weight: 600;
  --heading-letter-spacing: -0.01em;
  --heading-line-height: 1.2;

  /* Shape — medium rounded, elegant */
  --radius: 0.5rem;
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.25rem;
  --radius-full: 9999px;
  --avatar-radius: 9999px;
  --badge-radius: 9999px;
  --button-radius: 0.5rem;
  --input-radius: 0.5rem;
  --card-radius: 0.75rem;
  --tooltip-radius: 0.375rem;

  /* Component shadows */
  --card-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.04);
  --dropdown-shadow: 0 8px 16px -3px rgb(0 0 0 / 0.06), 0 3px 6px -3px rgb(0 0 0 / 0.03);
  --dialog-shadow: 0 14px 24px -5px rgb(0 0 0 / 0.07), 0 5px 8px -5px rgb(0 0 0 / 0.03);
  --button-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.04);

  /* Borders & dividers */
  --border-width: 1px;
  --border-style: solid;
  --divider-style: solid;
  --divider-opacity: 0.12;

  /* Inputs */
  --input-style: bordered;
  --input-border-on-focus: 0;
  --placeholder-opacity: 0.45;

  /* Buttons */
  --button-style: filled;
  --button-weight: 500;
  --hover-effect: darken;
  --active-effect: scale-down;
  --disabled-opacity: 0.5;

  /* Links */
  --link-style: color-only;
  --link-weight: inherit;

  /* Focus */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-style: ring;

  /* Icons */
  --icon-style: outlined;
  --icon-stroke-width: 1.5;
  --icon-size: 1.25rem;

  /* Scrollbar */
  --scrollbar-style: thin;
  --scrollbar-track: transparent;
  --scrollbar-thumb: rgba(0, 0, 0, 0.12);

  /* Selection */
  --selection-background: 35 85% 45%;
  --selection-foreground: 0 0% 100%;

  /* Tooltips */
  --tooltip-style: dark;

  /* Tables */
  --table-style: clean;
  --table-header-weight: 600;

  /* Loading */
  --spinner-style: circle;

  /* Motion */
  --transition-duration: 200ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-speed: normal;
  --hover-transition: 200ms ease;
  --enter-transition: 250ms ease-out;
  --exit-transition: 200ms ease-in;
}`

export const maisonConfig = `:root {
  /* Colors — deep navy/gold, minimal borders */
  --background: 220 20% 98%;
  --foreground: 220 25% 10%;
  --card: 220 15% 99%;
  --card-foreground: 220 25% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 220 25% 10%;
  --primary: 220 60% 25%;
  --primary-foreground: 45 80% 80%;
  --secondary: 220 10% 95%;
  --secondary-foreground: 220 15% 40%;
  --accent: 45 30% 92%;
  --accent-foreground: 220 60% 20%;
  --muted: 220 10% 95%;
  --muted-foreground: 220 8% 50%;
  --destructive: 0 65% 45%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 50% 38%;
  --success-foreground: 0 0% 100%;
  --warning: 45 80% 50%;
  --warning-foreground: 220 25% 10%;
  --border: 220 8% 90%;
  --input: 220 8% 90%;
  --ring: 220 60% 25%;
  --chart-1: 220 60% 25%;
  --chart-2: 45 80% 50%;
  --chart-3: 160 40% 40%;
  --chart-4: 340 40% 45%;
  --chart-5: 280 30% 45%;

  /* Sidebar */
  --sidebar-background: 220 25% 8%;
  --sidebar-foreground: 220 10% 80%;
  --sidebar-primary: 45 80% 65%;
  --sidebar-primary-foreground: 220 25% 8%;
  --sidebar-accent: 220 20% 15%;
  --sidebar-accent-foreground: 0 0% 100%;
  --sidebar-border: 220 15% 16%;
  --sidebar-ring: 220 60% 25%;

  /* Typography — serif headings */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-weight-normal: 300;
  --font-weight-medium: 400;
  --font-weight-semibold: 500;
  --font-weight-bold: 600;

  /* Shadows — subtle, luxurious */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.02);
  --shadow-md: 0 2px 4px -1px rgb(0 0 0 / 0.03), 0 1px 2px -1px rgb(0 0 0 / 0.02);
  --shadow-lg: 0 6px 12px -3px rgb(0 0 0 / 0.04), 0 2px 4px -2px rgb(0 0 0 / 0.02);
  --shadow-xl: 0 12px 24px -6px rgb(0 0 0 / 0.05), 0 4px 8px -4px rgb(0 0 0 / 0.02);

  /* Glass & overlay */
  --overlay-opacity: 0.4;
  --backdrop-blur: 12px;
  --glass-bg: rgba(252, 252, 254, 0.9);
  --glass-border: rgba(255, 255, 255, 0.2);

  /* Spacing & density — generous */
  --spacing-scale: 1.2;
  --container-max-width: 1200px;
  --container-padding: 2.5rem;
  --card-padding: 2rem;
  --input-height: 3rem;
  --button-height: 2.75rem;
  --section-gap: 6rem;

  /* Typography tokens */
  --letter-spacing-tighter: -0.05em;
  --letter-spacing-tight: -0.03em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.05em;
  --letter-spacing-wider: 0.1em;
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.8;
  --heading-weight: 400;
  --heading-letter-spacing: -0.03em;
  --heading-line-height: 1.15;

  /* Shape — large radius */
  --radius: 0.75rem;
  --radius-none: 0;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
  --avatar-radius: 9999px;
  --badge-radius: 9999px;
  --button-radius: 0.5rem;
  --input-radius: 0.375rem;
  --card-radius: 0.75rem;
  --tooltip-radius: 0.375rem;

  /* Component shadows */
  --card-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.02);
  --dropdown-shadow: 0 6px 12px -3px rgb(0 0 0 / 0.04), 0 2px 4px -2px rgb(0 0 0 / 0.02);
  --dialog-shadow: 0 12px 24px -6px rgb(0 0 0 / 0.05), 0 4px 8px -4px rgb(0 0 0 / 0.02);
  --button-shadow: none;

  /* Borders & dividers */
  --border-width: 1px;
  --border-style: solid;
  --divider-style: solid;
  --divider-opacity: 0.08;

  /* Inputs */
  --input-style: bordered;
  --input-border-on-focus: 0;
  --placeholder-opacity: 0.4;

  /* Buttons */
  --button-style: filled;
  --button-weight: 400;
  --hover-effect: darken;
  --active-effect: scale-down;
  --disabled-opacity: 0.4;

  /* Links */
  --link-style: underline;
  --link-weight: inherit;

  /* Focus */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-style: ring;

  /* Icons */
  --icon-style: outlined;
  --icon-stroke-width: 1;
  --icon-size: 1.25rem;

  /* Scrollbar */
  --scrollbar-style: thin;
  --scrollbar-track: transparent;
  --scrollbar-thumb: rgba(0, 0, 0, 0.08);

  /* Selection */
  --selection-background: 220 60% 25%;
  --selection-foreground: 45 80% 80%;

  /* Tooltips */
  --tooltip-style: dark;

  /* Tables */
  --table-style: clean;
  --table-header-weight: 500;

  /* Loading */
  --spinner-style: circle;

  /* Motion */
  --transition-duration: 250ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-speed: normal;
  --hover-transition: 250ms ease;
  --enter-transition: 300ms ease-out;
  --exit-transition: 200ms ease-in;
}`

export const emberConfig = `:root {
  /* Colors — terracotta/warm red */
  --background: 15 30% 99%;
  --foreground: 15 15% 12%;
  --card: 15 20% 99%;
  --card-foreground: 15 15% 12%;
  --popover: 0 0% 100%;
  --popover-foreground: 15 15% 12%;
  --primary: 12 75% 45%;
  --primary-foreground: 0 0% 100%;
  --secondary: 15 15% 95%;
  --secondary-foreground: 15 10% 40%;
  --accent: 12 35% 92%;
  --accent-foreground: 12 75% 35%;
  --muted: 15 15% 95%;
  --muted-foreground: 15 8% 45%;
  --destructive: 0 70% 48%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 55% 38%;
  --success-foreground: 0 0% 100%;
  --warning: 38 85% 48%;
  --warning-foreground: 15 15% 12%;
  --border: 15 10% 90%;
  --input: 15 10% 90%;
  --ring: 12 75% 45%;
  --chart-1: 12 75% 45%;
  --chart-2: 35 80% 50%;
  --chart-3: 142 55% 38%;
  --chart-4: 200 50% 45%;
  --chart-5: 280 40% 45%;

  /* Sidebar */
  --sidebar-background: 15 12% 97%;
  --sidebar-foreground: 15 15% 12%;
  --sidebar-primary: 12 75% 45%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 12 35% 92%;
  --sidebar-accent-foreground: 12 75% 35%;
  --sidebar-border: 15 10% 90%;
  --sidebar-ring: 12 75% 45%;

  /* Typography — serif headings for menu items */
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Shadows */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  --shadow-md: 0 2px 5px -1px rgb(0 0 0 / 0.04), 0 1px 3px -1px rgb(0 0 0 / 0.03);
  --shadow-lg: 0 6px 12px -2px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03);
  --shadow-xl: 0 12px 20px -4px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.03);

  /* Glass & overlay */
  --overlay-opacity: 0.5;
  --backdrop-blur: 10px;
  --glass-bg: rgba(255, 252, 250, 0.85);
  --glass-border: rgba(255, 255, 255, 0.18);

  /* Spacing & density */
  --spacing-scale: 1.05;
  --container-max-width: 1200px;
  --container-padding: 2rem;
  --card-padding: 1.75rem;
  --input-height: 2.75rem;
  --button-height: 2.5rem;
  --section-gap: 5rem;

  /* Typography tokens */
  --letter-spacing-tighter: -0.04em;
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
  --letter-spacing-wider: 0.05em;
  --line-height-tight: 1.3;
  --line-height-normal: 1.55;
  --line-height-relaxed: 1.75;
  --heading-weight: 600;
  --heading-letter-spacing: -0.015em;
  --heading-line-height: 1.2;

  /* Shape */
  --radius: 0.5rem;
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.625rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
  --avatar-radius: 9999px;
  --badge-radius: 9999px;
  --button-radius: 0.5rem;
  --input-radius: 0.5rem;
  --card-radius: 0.625rem;
  --tooltip-radius: 0.375rem;

  /* Component shadows */
  --card-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.03);
  --dropdown-shadow: 0 6px 12px -2px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03);
  --dialog-shadow: 0 12px 20px -4px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.03);
  --button-shadow: none;

  /* Borders & dividers */
  --border-width: 1px;
  --border-style: solid;
  --divider-style: solid;
  --divider-opacity: 0.12;

  /* Inputs */
  --input-style: bordered;
  --input-border-on-focus: 0;
  --placeholder-opacity: 0.45;

  /* Buttons */
  --button-style: filled;
  --button-weight: 500;
  --hover-effect: darken;
  --active-effect: scale-down;
  --disabled-opacity: 0.5;

  /* Links */
  --link-style: color-only;
  --link-weight: inherit;

  /* Focus */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-style: ring;

  /* Icons */
  --icon-style: outlined;
  --icon-stroke-width: 1.5;
  --icon-size: 1.25rem;

  /* Scrollbar */
  --scrollbar-style: thin;
  --scrollbar-track: transparent;
  --scrollbar-thumb: rgba(0, 0, 0, 0.12);

  /* Selection */
  --selection-background: 12 75% 45%;
  --selection-foreground: 0 0% 100%;

  /* Tooltips */
  --tooltip-style: dark;

  /* Tables */
  --table-style: clean;
  --table-header-weight: 600;

  /* Loading */
  --spinner-style: circle;

  /* Motion */
  --transition-duration: 200ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-speed: normal;
  --hover-transition: 200ms ease;
  --enter-transition: 250ms ease-out;
  --exit-transition: 200ms ease-in;
}`

export const verveConfig = `:root {
  /* Colors — vibrant blue, trust-building */
  --background: 0 0% 99%;
  --foreground: 220 15% 10%;
  --card: 0 0% 100%;
  --card-foreground: 220 15% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 220 15% 10%;
  --primary: 220 80% 50%;
  --primary-foreground: 0 0% 100%;
  --secondary: 220 10% 96%;
  --secondary-foreground: 220 10% 40%;
  --accent: 220 40% 94%;
  --accent-foreground: 220 80% 40%;
  --muted: 220 10% 96%;
  --muted-foreground: 220 8% 46%;
  --destructive: 0 80% 50%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 65% 38%;
  --success-foreground: 0 0% 100%;
  --warning: 38 90% 50%;
  --warning-foreground: 220 15% 10%;
  --border: 220 10% 91%;
  --input: 220 10% 91%;
  --ring: 220 80% 50%;
  --chart-1: 220 80% 50%;
  --chart-2: 160 60% 42%;
  --chart-3: 38 90% 50%;
  --chart-4: 340 60% 52%;
  --chart-5: 280 50% 50%;

  /* Sidebar */
  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 220 15% 10%;
  --sidebar-primary: 220 80% 50%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 220 40% 94%;
  --sidebar-accent-foreground: 220 80% 40%;
  --sidebar-border: 220 10% 91%;
  --sidebar-ring: 220 80% 50%;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Shadows */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --shadow-md: 0 2px 6px -1px rgb(0 0 0 / 0.06), 0 1px 3px -1px rgb(0 0 0 / 0.04);
  --shadow-lg: 0 8px 16px -3px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.04);
  --shadow-xl: 0 14px 24px -5px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.04);

  /* Glass & overlay */
  --overlay-opacity: 0.5;
  --backdrop-blur: 8px;
  --glass-bg: rgba(252, 252, 253, 0.8);
  --glass-border: rgba(255, 255, 255, 0.15);

  /* Spacing & density — medium */
  --spacing-scale: 1;
  --container-max-width: 1280px;
  --container-padding: 2rem;
  --card-padding: 1.5rem;
  --input-height: 2.5rem;
  --button-height: 2.25rem;
  --section-gap: 4rem;

  /* Typography tokens */
  --letter-spacing-tighter: -0.04em;
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
  --letter-spacing-wider: 0.05em;
  --line-height-tight: 1.3;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;
  --heading-weight: 700;
  --heading-letter-spacing: -0.02em;
  --heading-line-height: 1.2;

  /* Shape */
  --radius: 0.5rem;
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
  --avatar-radius: 9999px;
  --badge-radius: 9999px;
  --button-radius: 0.5rem;
  --input-radius: 0.5rem;
  --card-radius: 0.5rem;
  --tooltip-radius: 0.375rem;

  /* Component shadows */
  --card-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.04);
  --dropdown-shadow: 0 8px 16px -3px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.04);
  --dialog-shadow: 0 14px 24px -5px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.04);
  --button-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.04);

  /* Borders & dividers */
  --border-width: 1px;
  --border-style: solid;
  --divider-style: solid;
  --divider-opacity: 0.12;

  /* Inputs */
  --input-style: bordered;
  --input-border-on-focus: 0;
  --placeholder-opacity: 0.5;

  /* Buttons */
  --button-style: filled;
  --button-weight: 500;
  --hover-effect: darken;
  --active-effect: scale-down;
  --disabled-opacity: 0.5;

  /* Links */
  --link-style: color-only;
  --link-weight: 500;

  /* Focus */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-style: ring;

  /* Icons */
  --icon-style: outlined;
  --icon-stroke-width: 1.5;
  --icon-size: 1.25rem;

  /* Scrollbar */
  --scrollbar-style: thin;
  --scrollbar-track: transparent;
  --scrollbar-thumb: rgba(0, 0, 0, 0.12);

  /* Selection */
  --selection-background: 220 80% 50%;
  --selection-foreground: 0 0% 100%;

  /* Tooltips */
  --tooltip-style: dark;

  /* Tables */
  --table-style: clean;
  --table-header-weight: 600;

  /* Loading */
  --spinner-style: circle;

  /* Motion */
  --transition-duration: 150ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-speed: fast;
  --hover-transition: 150ms ease;
  --enter-transition: 200ms ease-out;
  --exit-transition: 150ms ease-in;
}`

export const insightiqConfig = `:root {
  /* Colors — indigo primary, data-focused, crisp shadows */
  --background: 0 0% 99%;
  --foreground: 240 10% 10%;
  --card: 0 0% 99%;
  --card-foreground: 240 10% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 10%;
  --primary: 250 50% 50%;
  --primary-foreground: 0 0% 100%;
  --secondary: 240 5% 96%;
  --secondary-foreground: 240 4% 44%;
  --accent: 250 30% 95%;
  --accent-foreground: 250 50% 40%;
  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 44%;
  --destructive: 0 84% 50%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 71% 35%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 240 10% 10%;
  --border: 240 6% 92%;
  --input: 240 6% 92%;
  --ring: 250 50% 50%;
  --chart-1: 250 50% 50%;
  --chart-2: 173 80% 36%;
  --chart-3: 38 92% 50%;
  --chart-4: 330 65% 50%;
  --chart-5: 201 96% 42%;

  /* Sidebar */
  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 240 10% 10%;
  --sidebar-primary: 250 50% 50%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 250 30% 95%;
  --sidebar-accent-foreground: 250 50% 40%;
  --sidebar-border: 240 6% 92%;
  --sidebar-ring: 250 50% 50%;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Shadows — crisp */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --shadow-md: 0 2px 4px -1px rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.04);
  --shadow-lg: 0 6px 12px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04);
  --shadow-xl: 0 12px 20px -4px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.04);

  /* Glass & overlay */
  --overlay-opacity: 0.5;
  --backdrop-blur: 8px;
  --glass-bg: rgba(252, 252, 253, 0.8);
  --glass-border: rgba(255, 255, 255, 0.15);

  /* Spacing & density */
  --spacing-scale: 1;
  --container-max-width: 1280px;
  --container-padding: 2rem;
  --card-padding: 1.5rem;
  --input-height: 2.5rem;
  --button-height: 2.25rem;
  --section-gap: 4rem;

  /* Typography tokens */
  --letter-spacing-tighter: -0.04em;
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
  --letter-spacing-wider: 0.05em;
  --line-height-tight: 1.3;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;
  --heading-weight: 700;
  --heading-letter-spacing: -0.02em;
  --heading-line-height: 1.2;

  /* Shape */
  --radius: 0.375rem;
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
  --avatar-radius: 9999px;
  --badge-radius: 9999px;
  --button-radius: 0.375rem;
  --input-radius: 0.375rem;
  --card-radius: 0.5rem;
  --tooltip-radius: 0.375rem;

  /* Component shadows */
  --card-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.04);
  --dropdown-shadow: 0 6px 12px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04);
  --dialog-shadow: 0 12px 20px -4px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.04);
  --button-shadow: none;

  /* Borders & dividers */
  --border-width: 1px;
  --border-style: solid;
  --divider-style: solid;
  --divider-opacity: 0.15;

  /* Inputs */
  --input-style: bordered;
  --input-border-on-focus: 0;
  --placeholder-opacity: 0.5;

  /* Buttons */
  --button-style: filled;
  --button-weight: 500;
  --hover-effect: darken;
  --active-effect: scale-down;
  --disabled-opacity: 0.5;

  /* Links */
  --link-style: color-only;
  --link-weight: inherit;

  /* Focus */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-style: ring;

  /* Icons */
  --icon-style: outlined;
  --icon-stroke-width: 1.5;
  --icon-size: 1.25rem;

  /* Scrollbar */
  --scrollbar-style: thin;
  --scrollbar-track: transparent;
  --scrollbar-thumb: rgba(0, 0, 0, 0.15);

  /* Selection */
  --selection-background: 250 50% 50%;
  --selection-foreground: 0 0% 100%;

  /* Tooltips */
  --tooltip-style: dark;

  /* Tables */
  --table-style: clean;
  --table-header-weight: 600;

  /* Loading */
  --spinner-style: circle;

  /* Motion */
  --transition-duration: 150ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-speed: fast;
  --hover-transition: 150ms ease;
  --enter-transition: 200ms ease-out;
  --exit-transition: 150ms ease-in;
}`

export const vitalinkConfig = `:root {
  /* Colors — calming blue/teal, accessible */
  --background: 0 0% 99%;
  --foreground: 210 15% 12%;
  --card: 0 0% 100%;
  --card-foreground: 210 15% 12%;
  --popover: 0 0% 100%;
  --popover-foreground: 210 15% 12%;
  --primary: 199 89% 38%;
  --primary-foreground: 0 0% 100%;
  --secondary: 195 20% 96%;
  --secondary-foreground: 195 10% 40%;
  --accent: 199 40% 92%;
  --accent-foreground: 199 89% 28%;
  --muted: 210 10% 96%;
  --muted-foreground: 210 8% 45%;
  --destructive: 0 84% 50%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 71% 35%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 210 15% 12%;
  --border: 210 10% 91%;
  --input: 210 10% 91%;
  --ring: 199 89% 38%;
  --chart-1: 199 89% 38%;
  --chart-2: 142 71% 35%;
  --chart-3: 38 92% 50%;
  --chart-4: 280 50% 50%;
  --chart-5: 340 55% 50%;

  /* Sidebar */
  --sidebar-background: 199 20% 97%;
  --sidebar-foreground: 210 15% 12%;
  --sidebar-primary: 199 89% 38%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 199 40% 92%;
  --sidebar-accent-foreground: 199 89% 28%;
  --sidebar-border: 210 10% 91%;
  --sidebar-ring: 199 89% 38%;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Shadows */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  --shadow-md: 0 2px 4px -1px rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.03);
  --shadow-lg: 0 6px 10px -2px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03);
  --shadow-xl: 0 12px 20px -4px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.03);

  /* Glass & overlay */
  --overlay-opacity: 0.5;
  --backdrop-blur: 8px;
  --glass-bg: rgba(252, 252, 253, 0.8);
  --glass-border: rgba(255, 255, 255, 0.15);

  /* Spacing & density — generous spacing for readability */
  --spacing-scale: 1.1;
  --container-max-width: 1280px;
  --container-padding: 2rem;
  --card-padding: 1.75rem;
  --input-height: 2.75rem;
  --button-height: 2.5rem;
  --section-gap: 5rem;

  /* Typography tokens */
  --letter-spacing-tighter: -0.04em;
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
  --letter-spacing-wider: 0.05em;
  --line-height-tight: 1.3;
  --line-height-normal: 1.55;
  --line-height-relaxed: 1.75;
  --heading-weight: 700;
  --heading-letter-spacing: -0.02em;
  --heading-line-height: 1.2;

  /* Shape */
  --radius: 0.5rem;
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.625rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
  --avatar-radius: 9999px;
  --badge-radius: 9999px;
  --button-radius: 0.5rem;
  --input-radius: 0.5rem;
  --card-radius: 0.625rem;
  --tooltip-radius: 0.375rem;

  /* Component shadows */
  --card-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.03);
  --dropdown-shadow: 0 6px 10px -2px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03);
  --dialog-shadow: 0 12px 20px -4px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.03);
  --button-shadow: none;

  /* Borders & dividers */
  --border-width: 1px;
  --border-style: solid;
  --divider-style: solid;
  --divider-opacity: 0.12;

  /* Inputs */
  --input-style: bordered;
  --input-border-on-focus: 0;
  --placeholder-opacity: 0.5;

  /* Buttons */
  --button-style: filled;
  --button-weight: 500;
  --hover-effect: darken;
  --active-effect: scale-down;
  --disabled-opacity: 0.5;

  /* Links */
  --link-style: color-only;
  --link-weight: inherit;

  /* Focus */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-style: ring;

  /* Icons */
  --icon-style: outlined;
  --icon-stroke-width: 1.5;
  --icon-size: 1.25rem;

  /* Scrollbar */
  --scrollbar-style: thin;
  --scrollbar-track: transparent;
  --scrollbar-thumb: rgba(0, 0, 0, 0.12);

  /* Selection */
  --selection-background: 199 89% 38%;
  --selection-foreground: 0 0% 100%;

  /* Tooltips */
  --tooltip-style: dark;

  /* Tables */
  --table-style: clean;
  --table-header-weight: 600;

  /* Loading */
  --spinner-style: circle;

  /* Motion */
  --transition-duration: 150ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-speed: fast;
  --hover-transition: 150ms ease;
  --enter-transition: 200ms ease-out;
  --exit-transition: 150ms ease-in;
}`

export const learnhubConfig = `:root {
  /* Colors — warm purple, friendly */
  --background: 0 0% 99%;
  --foreground: 240 10% 10%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 10%;
  --primary: 262 52% 47%;
  --primary-foreground: 0 0% 100%;
  --secondary: 260 10% 96%;
  --secondary-foreground: 260 5% 40%;
  --accent: 262 30% 92%;
  --accent-foreground: 262 52% 37%;
  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 44%;
  --destructive: 0 80% 50%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 71% 35%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 240 10% 10%;
  --border: 240 6% 92%;
  --input: 240 6% 92%;
  --ring: 262 52% 47%;
  --chart-1: 262 52% 47%;
  --chart-2: 173 70% 38%;
  --chart-3: 38 92% 50%;
  --chart-4: 340 60% 52%;
  --chart-5: 200 80% 45%;

  /* Sidebar */
  --sidebar-background: 262 15% 97%;
  --sidebar-foreground: 240 10% 10%;
  --sidebar-primary: 262 52% 47%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 262 30% 92%;
  --sidebar-accent-foreground: 262 52% 37%;
  --sidebar-border: 240 6% 92%;
  --sidebar-ring: 262 52% 47%;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Shadows */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  --shadow-md: 0 2px 4px -1px rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.03);
  --shadow-lg: 0 6px 10px -2px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03);
  --shadow-xl: 0 12px 20px -4px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.03);

  /* Glass & overlay */
  --overlay-opacity: 0.5;
  --backdrop-blur: 8px;
  --glass-bg: rgba(252, 252, 253, 0.8);
  --glass-border: rgba(255, 255, 255, 0.15);

  /* Spacing & density */
  --spacing-scale: 1;
  --container-max-width: 1280px;
  --container-padding: 2rem;
  --card-padding: 1.5rem;
  --input-height: 2.5rem;
  --button-height: 2.25rem;
  --section-gap: 4rem;

  /* Typography tokens */
  --letter-spacing-tighter: -0.04em;
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
  --letter-spacing-wider: 0.05em;
  --line-height-tight: 1.3;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;
  --heading-weight: 700;
  --heading-letter-spacing: -0.02em;
  --heading-line-height: 1.2;

  /* Shape — medium radius, friendly */
  --radius: 0.75rem;
  --radius-none: 0;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.25rem;
  --radius-full: 9999px;
  --avatar-radius: 9999px;
  --badge-radius: 9999px;
  --button-radius: 0.75rem;
  --input-radius: 0.5rem;
  --card-radius: 0.75rem;
  --tooltip-radius: 0.375rem;

  /* Component shadows */
  --card-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.03);
  --dropdown-shadow: 0 6px 10px -2px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03);
  --dialog-shadow: 0 12px 20px -4px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.03);
  --button-shadow: none;

  /* Borders & dividers */
  --border-width: 1px;
  --border-style: solid;
  --divider-style: solid;
  --divider-opacity: 0.12;

  /* Inputs */
  --input-style: bordered;
  --input-border-on-focus: 0;
  --placeholder-opacity: 0.5;

  /* Buttons */
  --button-style: filled;
  --button-weight: 500;
  --hover-effect: darken;
  --active-effect: scale-down;
  --disabled-opacity: 0.5;

  /* Links */
  --link-style: color-only;
  --link-weight: inherit;

  /* Focus */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-style: ring;

  /* Icons */
  --icon-style: outlined;
  --icon-stroke-width: 1.5;
  --icon-size: 1.25rem;

  /* Scrollbar */
  --scrollbar-style: thin;
  --scrollbar-track: transparent;
  --scrollbar-thumb: rgba(0, 0, 0, 0.12);

  /* Selection */
  --selection-background: 262 52% 47%;
  --selection-foreground: 0 0% 100%;

  /* Tooltips */
  --tooltip-style: dark;

  /* Tables */
  --table-style: clean;
  --table-header-weight: 600;

  /* Loading */
  --spinner-style: circle;

  /* Motion */
  --transition-duration: 150ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-speed: fast;
  --hover-transition: 150ms ease;
  --enter-transition: 200ms ease-out;
  --exit-transition: 150ms ease-in;
}`

export const clearbankConfig = `:root {
  /* Colors — navy blue, trustworthy, sharp, professional */
  --background: 0 0% 99%;
  --foreground: 220 15% 10%;
  --card: 0 0% 100%;
  --card-foreground: 220 15% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 220 15% 10%;
  --primary: 220 70% 45%;
  --primary-foreground: 0 0% 100%;
  --secondary: 220 10% 96%;
  --secondary-foreground: 220 8% 40%;
  --accent: 220 30% 92%;
  --accent-foreground: 220 70% 35%;
  --muted: 220 10% 96%;
  --muted-foreground: 220 8% 45%;
  --destructive: 0 84% 50%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 71% 35%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 220 15% 10%;
  --border: 220 10% 91%;
  --input: 220 10% 91%;
  --ring: 220 70% 45%;
  --chart-1: 220 70% 45%;
  --chart-2: 142 71% 35%;
  --chart-3: 38 92% 50%;
  --chart-4: 280 50% 50%;
  --chart-5: 340 55% 50%;

  /* Sidebar */
  --sidebar-background: 220 20% 7%;
  --sidebar-foreground: 220 10% 80%;
  --sidebar-primary: 220 70% 55%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 220 15% 14%;
  --sidebar-accent-foreground: 0 0% 100%;
  --sidebar-border: 220 12% 14%;
  --sidebar-ring: 220 70% 45%;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Shadows */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --shadow-md: 0 2px 4px -1px rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.04);
  --shadow-lg: 0 6px 12px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04);
  --shadow-xl: 0 12px 20px -4px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.04);

  /* Glass & overlay */
  --overlay-opacity: 0.5;
  --backdrop-blur: 8px;
  --glass-bg: rgba(252, 252, 253, 0.85);
  --glass-border: rgba(255, 255, 255, 0.15);

  /* Spacing & density — professional */
  --spacing-scale: 1;
  --container-max-width: 1280px;
  --container-padding: 2rem;
  --card-padding: 1.5rem;
  --input-height: 2.5rem;
  --button-height: 2.25rem;
  --section-gap: 4rem;

  /* Typography tokens */
  --letter-spacing-tighter: -0.04em;
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
  --letter-spacing-wider: 0.05em;
  --line-height-tight: 1.3;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;
  --heading-weight: 700;
  --heading-letter-spacing: -0.02em;
  --heading-line-height: 1.2;

  /* Shape — sharp, professional */
  --radius: 0.5rem;
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
  --avatar-radius: 9999px;
  --badge-radius: 9999px;
  --button-radius: 0.375rem;
  --input-radius: 0.375rem;
  --card-radius: 0.5rem;
  --tooltip-radius: 0.375rem;

  /* Component shadows */
  --card-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.04);
  --dropdown-shadow: 0 6px 12px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04);
  --dialog-shadow: 0 12px 20px -4px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.04);
  --button-shadow: none;

  /* Borders & dividers */
  --border-width: 1px;
  --border-style: solid;
  --divider-style: solid;
  --divider-opacity: 0.15;

  /* Inputs */
  --input-style: bordered;
  --input-border-on-focus: 0;
  --placeholder-opacity: 0.5;

  /* Buttons */
  --button-style: filled;
  --button-weight: 500;
  --hover-effect: darken;
  --active-effect: scale-down;
  --disabled-opacity: 0.5;

  /* Links */
  --link-style: color-only;
  --link-weight: inherit;

  /* Focus */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-style: ring;

  /* Icons */
  --icon-style: outlined;
  --icon-stroke-width: 1.5;
  --icon-size: 1.25rem;

  /* Scrollbar */
  --scrollbar-style: thin;
  --scrollbar-track: transparent;
  --scrollbar-thumb: rgba(0, 0, 0, 0.15);

  /* Selection */
  --selection-background: 220 70% 45%;
  --selection-foreground: 0 0% 100%;

  /* Tooltips */
  --tooltip-style: dark;

  /* Tables */
  --table-style: clean;
  --table-header-weight: 600;

  /* Loading */
  --spinner-style: circle;

  /* Motion */
  --transition-duration: 150ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-speed: fast;
  --hover-transition: 150ms ease;
  --enter-transition: 200ms ease-out;
  --exit-transition: 150ms ease-in;
}`

export const studioxConfig = `:root {
  /* Colors — black primary, dramatic, minimal */
  --background: 240 10% 4%;
  --foreground: 0 0% 95%;
  --card: 240 10% 6%;
  --card-foreground: 0 0% 95%;
  --popover: 240 10% 6%;
  --popover-foreground: 0 0% 95%;
  --primary: 0 0% 95%;
  --primary-foreground: 240 10% 4%;
  --secondary: 240 5% 12%;
  --secondary-foreground: 240 5% 65%;
  --accent: 240 5% 16%;
  --accent-foreground: 0 0% 90%;
  --muted: 240 5% 12%;
  --muted-foreground: 240 5% 55%;
  --destructive: 0 63% 40%;
  --destructive-foreground: 0 0% 95%;
  --success: 142 71% 45%;
  --success-foreground: 0 0% 95%;
  --warning: 38 92% 50%;
  --warning-foreground: 240 10% 4%;
  --border: 240 5% 14%;
  --input: 240 5% 14%;
  --ring: 0 0% 95%;
  --chart-1: 0 0% 85%;
  --chart-2: 173 60% 50%;
  --chart-3: 38 80% 55%;
  --chart-4: 330 55% 55%;
  --chart-5: 200 70% 50%;

  /* Sidebar */
  --sidebar-background: 240 10% 3%;
  --sidebar-foreground: 0 0% 90%;
  --sidebar-primary: 0 0% 95%;
  --sidebar-primary-foreground: 240 10% 4%;
  --sidebar-accent: 240 5% 10%;
  --sidebar-accent-foreground: 0 0% 90%;
  --sidebar-border: 240 5% 12%;
  --sidebar-ring: 0 0% 95%;

  /* Typography — clean, dramatic */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Shadows — subtle in dark */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.2);
  --shadow-md: 0 2px 4px -1px rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.2);
  --shadow-lg: 0 6px 10px -2px rgb(0 0 0 / 0.35), 0 2px 4px -2px rgb(0 0 0 / 0.2);
  --shadow-xl: 0 12px 20px -4px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.2);

  /* Glass & overlay */
  --overlay-opacity: 0.6;
  --backdrop-blur: 12px;
  --glass-bg: rgba(10, 10, 14, 0.8);
  --glass-border: rgba(255, 255, 255, 0.06);

  /* Spacing & density — generous, dramatic */
  --spacing-scale: 1.15;
  --container-max-width: 1280px;
  --container-padding: 2rem;
  --card-padding: 1.5rem;
  --input-height: 2.5rem;
  --button-height: 2.25rem;
  --section-gap: 5rem;

  /* Typography tokens */
  --letter-spacing-tighter: -0.06em;
  --letter-spacing-tight: -0.03em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.03em;
  --letter-spacing-wider: 0.08em;
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;
  --heading-weight: 700;
  --heading-letter-spacing: -0.04em;
  --heading-line-height: 0.95;

  /* Shape — minimal radius */
  --radius: 0.25rem;
  --radius-none: 0;
  --radius-sm: 0.125rem;
  --radius-md: 0.25rem;
  --radius-lg: 0.375rem;
  --radius-xl: 0.5rem;
  --radius-2xl: 0.75rem;
  --radius-full: 9999px;
  --avatar-radius: 9999px;
  --badge-radius: 0.25rem;
  --button-radius: 0.25rem;
  --input-radius: 0.25rem;
  --card-radius: 0.375rem;
  --tooltip-radius: 0.25rem;

  /* Component shadows */
  --card-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.2);
  --dropdown-shadow: 0 6px 10px -2px rgb(0 0 0 / 0.35), 0 2px 4px -2px rgb(0 0 0 / 0.2);
  --dialog-shadow: 0 12px 20px -4px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.2);
  --button-shadow: none;

  /* Borders & dividers */
  --border-width: 1px;
  --border-style: solid;
  --divider-style: solid;
  --divider-opacity: 0.08;

  /* Inputs */
  --input-style: bordered;
  --input-border-on-focus: 0;
  --placeholder-opacity: 0.4;

  /* Buttons */
  --button-style: filled;
  --button-weight: 500;
  --hover-effect: darken;
  --active-effect: scale-down;
  --disabled-opacity: 0.4;

  /* Links */
  --link-style: underline;
  --link-weight: inherit;

  /* Focus */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-style: ring;

  /* Icons */
  --icon-style: outlined;
  --icon-stroke-width: 1.5;
  --icon-size: 1.25rem;

  /* Scrollbar */
  --scrollbar-style: thin;
  --scrollbar-track: transparent;
  --scrollbar-thumb: rgba(255, 255, 255, 0.1);

  /* Selection */
  --selection-background: 0 0% 95%;
  --selection-foreground: 240 10% 4%;

  /* Tooltips */
  --tooltip-style: light;

  /* Tables */
  --table-style: clean;
  --table-header-weight: 600;

  /* Loading */
  --spinner-style: circle;

  /* Motion */
  --transition-duration: 200ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-speed: normal;
  --hover-transition: 200ms ease;
  --enter-transition: 300ms ease-out;
  --exit-transition: 200ms ease-in;
}`
