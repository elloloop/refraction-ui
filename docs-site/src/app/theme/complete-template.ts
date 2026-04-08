/**
 * The COMPLETE theme configuration template.
 * Every CSS variable that controls the visual identity.
 * ~95 variables organized by category.
 */
export const COMPLETE_THEME_TEMPLATE = `:root {
  /* ═══════════════════════════════════════════
     COLORS — Surface & Text
     ═══════════════════════════════════════════ */
  --background: 0 0% 99%;
  --foreground: 240 10% 10%;
  --card: 0 0% 99%;
  --card-foreground: 240 10% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 10%;

  /* ═══════════════════════════════════════════
     COLORS — Brand
     ═══════════════════════════════════════════ */
  --primary: 250 50% 50%;
  --primary-foreground: 0 0% 100%;
  --secondary: 240 5% 96%;
  --secondary-foreground: 240 4% 44%;
  --accent: 250 30% 95%;
  --accent-foreground: 250 50% 40%;

  /* ═══════════════════════════════════════════
     COLORS — Semantic
     ═══════════════════════════════════════════ */
  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 44%;
  --destructive: 0 84% 50%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 71% 35%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 240 10% 10%;

  /* ═══════════════════════════════════════════
     COLORS — Borders & Input
     ═══════════════════════════════════════════ */
  --border: 240 6% 92%;
  --input: 240 6% 92%;
  --ring: 250 50% 50%;

  /* ═══════════════════════════════════════════
     COLORS — Sidebar
     ═══════════════════════════════════════════ */
  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 240 10% 10%;
  --sidebar-primary: 250 50% 50%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 250 30% 95%;
  --sidebar-accent-foreground: 250 50% 40%;
  --sidebar-border: 240 6% 92%;
  --sidebar-ring: 250 50% 50%;

  /* ═══════════════════════════════════════════
     COLORS — Charts (colorblind-safe)
     ═══════════════════════════════════════════ */
  --chart-1: 250 50% 50%;
  --chart-2: 173 80% 36%;
  --chart-3: 38 92% 50%;
  --chart-4: 330 65% 50%;
  --chart-5: 201 96% 42%;

  /* ═══════════════════════════════════════════
     TYPOGRAPHY — Font Families
     ═══════════════════════════════════════════ */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* ═══════════════════════════════════════════
     TYPOGRAPHY — Size Scale
     ═══════════════════════════════════════════ */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;

  /* ═══════════════════════════════════════════
     TYPOGRAPHY — Weights
     ═══════════════════════════════════════════ */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* ═══════════════════════════════════════════
     TYPOGRAPHY — Heading Treatment
     ═══════════════════════════════════════════ */
  --heading-weight: 600;
  --heading-letter-spacing: -0.02em;
  --heading-line-height: 1.2;

  /* ═══════════════════════════════════════════
     TYPOGRAPHY — Letter Spacing Scale
     ═══════════════════════════════════════════ */
  --letter-spacing-tighter: -0.04em;
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
  --letter-spacing-wider: 0.05em;

  /* ═══════════════════════════════════════════
     TYPOGRAPHY — Line Height Scale
     ═══════════════════════════════════════════ */
  --line-height-tight: 1.3;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;

  /* ═══════════════════════════════════════════
     SHAPE — Radius Scale
     ═══════════════════════════════════════════ */
  --radius: 0.375rem;
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;

  /* ═══════════════════════════════════════════
     SHAPE — Per-Component Radius
     ═══════════════════════════════════════════ */
  --avatar-radius: 9999px;
  --badge-radius: 9999px;
  --button-radius: 0.375rem;
  --input-radius: 0.375rem;
  --card-radius: 0.5rem;
  --tooltip-radius: 0.375rem;

  /* ═══════════════════════════════════════════
     DEPTH — Shadows
     ═══════════════════════════════════════════ */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  --shadow-md: 0 2px 4px -1px rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.03);
  --shadow-lg: 0 6px 10px -2px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03);
  --shadow-xl: 0 12px 20px -4px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.03);

  /* ═══════════════════════════════════════════
     DEPTH — Per-Component Shadows
     ═══════════════════════════════════════════ */
  --card-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  --dropdown-shadow: 0 6px 10px -2px rgb(0 0 0 / 0.1);
  --dialog-shadow: 0 12px 20px -4px rgb(0 0 0 / 0.1);
  --button-shadow: none;

  /* ═══════════════════════════════════════════
     TRANSPARENCY & GLASS
     ═══════════════════════════════════════════ */
  --overlay-opacity: 0.5;
  --backdrop-blur: 8px;
  --glass-bg: rgba(252, 252, 253, 0.8);
  --glass-border: rgba(255, 255, 255, 0.15);

  /* ═══════════════════════════════════════════
     SPACING & DENSITY
     ═══════════════════════════════════════════ */
  --spacing-scale: 1;
  --card-padding: 1.5rem;
  --input-height: 2.5rem;
  --button-height: 2.5rem;
  --section-gap: 3rem;
  --container-max-width: 1280px;
  --container-padding: 2rem;

  /* ═══════════════════════════════════════════
     BORDERS & DIVIDERS
     ═══════════════════════════════════════════ */
  --border-width: 1px;
  --border-style: solid;
  --divider-style: solid;
  --divider-opacity: 0.15;

  /* ═══════════════════════════════════════════
     COMPONENT STYLES — Inputs
     ═══════════════════════════════════════════ */
  --input-style: bordered;
  --input-border-on-focus: false;
  --placeholder-opacity: 0.5;

  /* ═══════════════════════════════════════════
     COMPONENT STYLES — Buttons
     ═══════════════════════════════════════════ */
  --button-style: filled;
  --button-weight: 500;
  --hover-effect: darken;
  --active-effect: scale-down;
  --disabled-opacity: 0.5;

  /* ═══════════════════════════════════════════
     COMPONENT STYLES — Links
     ═══════════════════════════════════════════ */
  --link-style: color-only;
  --link-weight: inherit;

  /* ═══════════════════════════════════════════
     FOCUS
     ═══════════════════════════════════════════ */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-style: ring;

  /* ═══════════════════════════════════════════
     ICONS
     ═══════════════════════════════════════════ */
  --icon-style: outlined;
  --icon-stroke-width: 1.5;
  --icon-size: 1rem;

  /* ═══════════════════════════════════════════
     SCROLLBAR
     ═══════════════════════════════════════════ */
  --scrollbar-style: thin;
  --scrollbar-track: transparent;
  --scrollbar-thumb: rgba(0, 0, 0, 0.1);

  /* ═══════════════════════════════════════════
     SELECTION HIGHLIGHT
     ═══════════════════════════════════════════ */
  --selection-background: 250 50% 90%;
  --selection-foreground: 240 10% 10%;

  /* ═══════════════════════════════════════════
     TOOLTIPS, TABLES, LOADING
     ═══════════════════════════════════════════ */
  --tooltip-style: dark;
  --table-style: clean;
  --table-header-weight: 600;
  --spinner-style: circle;

  /* ═══════════════════════════════════════════
     MOTION & ANIMATION
     ═══════════════════════════════════════════ */
  --transition-duration: 150ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-speed: normal;
  --hover-transition: 150ms ease;
  --enter-transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --exit-transition: 150ms cubic-bezier(0.4, 0, 1, 1);
}`
