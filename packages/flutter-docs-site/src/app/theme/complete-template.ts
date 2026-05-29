/**
 * Theme configuration templates.
 *
 * SIMPLE_THEME_TEMPLATE (~25 variables): Colors, fonts, and radius.
 * For most developers who just want to set their brand colors and fonts.
 *
 * ADVANCED_THEME_TEMPLATE (~65 variables): Full brand control.
 * For designers and brand-conscious teams who want every visual detail.
 */

export const SIMPLE_THEME_TEMPLATE = `:root {
  /* ═══════════════════════════════════════════
     BRAND COLORS
     ═══════════════════════════════════════════ */
  --background: 0 0% 99%;
  --foreground: 240 10% 10%;
  --primary: 250 50% 50%;
  --primary-foreground: 0 0% 100%;
  --secondary: 240 5% 96%;
  --secondary-foreground: 240 4% 44%;
  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 44%;
  --accent: 250 30% 95%;
  --accent-foreground: 250 50% 40%;
  --destructive: 0 84% 50%;
  --destructive-foreground: 0 0% 100%;
  --border: 240 6% 92%;
  --input: 240 6% 92%;
  --ring: 250 50% 50%;

  /* ═══════════════════════════════════════════
     FONTS
     ═══════════════════════════════════════════ */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* ═══════════════════════════════════════════
     SHAPE & FEEL
     ═══════════════════════════════════════════ */
  --radius: 0.375rem;
}`

export const ADVANCED_THEME_TEMPLATE = `:root {
  /* ═══════════════════════════════════════════
     BRAND COLORS
     ═══════════════════════════════════════════ */
  --background: 0 0% 99%;
  --foreground: 240 10% 10%;
  --primary: 250 50% 50%;
  --primary-foreground: 0 0% 100%;
  --secondary: 240 5% 96%;
  --secondary-foreground: 240 4% 44%;
  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 44%;
  --accent: 250 30% 95%;
  --accent-foreground: 250 50% 40%;
  --destructive: 0 84% 50%;
  --destructive-foreground: 0 0% 100%;
  --border: 240 6% 92%;
  --input: 240 6% 92%;
  --ring: 250 50% 50%;

  /* ═══════════════════════════════════════════
     EXTENDED COLORS
     ═══════════════════════════════════════════ */
  --card: 0 0% 99%;
  --card-foreground: 240 10% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 10%;
  --success: 142 71% 35%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 240 10% 10%;

  /* ═══════════════════════════════════════════
     SIDEBAR COLORS
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
     CHART COLORS (colorblind-safe)
     ═══════════════════════════════════════════ */
  --chart-1: 250 50% 50%;
  --chart-2: 173 80% 36%;
  --chart-3: 38 92% 50%;
  --chart-4: 330 65% 50%;
  --chart-5: 201 96% 42%;

  /* ═══════════════════════════════════════════
     FONTS
     ═══════════════════════════════════════════ */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* ═══════════════════════════════════════════
     TYPOGRAPHY DETAILS
     ═══════════════════════════════════════════ */
  --heading-weight: 600;
  --heading-letter-spacing: -0.02em;
  --heading-line-height: 1.2;
  --font-size-base: 1rem;

  /* ═══════════════════════════════════════════
     SHAPE & FEEL
     ═══════════════════════════════════════════ */
  --radius: 0.375rem;

  /* ═══════════════════════════════════════════
     PER-COMPONENT RADIUS
     ═══════════════════════════════════════════ */
  --avatar-radius: 9999px;
  --badge-radius: 9999px;
  --button-radius: 0.375rem;
  --card-radius: 0.5rem;

  /* ═══════════════════════════════════════════
     DEPTH — Shadows
     ═══════════════════════════════════════════ */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  --shadow-md: 0 2px 4px -1px rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.03);
  --shadow-lg: 0 6px 10px -2px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03);
  --card-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  --button-shadow: none;

  /* ═══════════════════════════════════════════
     TRANSPARENCY & GLASS
     ═══════════════════════════════════════════ */
  --overlay-opacity: 0.5;
  --backdrop-blur: 8px;
  --glass-bg: rgba(252, 252, 253, 0.8);

  /* ═══════════════════════════════════════════
     DENSITY
     ═══════════════════════════════════════════ */
  --spacing-scale: 1;
  --card-padding: 1.5rem;
  --input-height: 2.5rem;
  --container-max-width: 1280px;

  /* ═══════════════════════════════════════════
     BORDERS
     ═══════════════════════════════════════════ */
  --border-width: 1px;

  /* ═══════════════════════════════════════════
     COMPONENT STYLES
     ═══════════════════════════════════════════ */
  --input-style: bordered;
  --button-style: filled;
  --hover-effect: darken;
  --disabled-opacity: 0.5;
  --link-style: color-only;
  --icon-style: outlined;
  --icon-stroke-width: 1.5;
  --tooltip-style: dark;
  --table-style: clean;
  --scrollbar-style: thin;
  --focus-ring-style: ring;

  /* ═══════════════════════════════════════════
     SELECTION HIGHLIGHT
     ═══════════════════════════════════════════ */
  --selection-background: 250 50% 90%;
  --selection-foreground: 240 10% 10%;
}`

/** @deprecated Use SIMPLE_THEME_TEMPLATE or ADVANCED_THEME_TEMPLATE instead */
export const COMPLETE_THEME_TEMPLATE = ADVANCED_THEME_TEMPLATE
