/** Semantic color tokens mapped to CSS custom properties */
export const colors = {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
  popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
    // Interaction depth (issue #485) — fall back to DEFAULT is intentional:
    // consumers on older stylesheets that lack these vars keep the base look.
    hover: 'hsl(var(--primary-hover, var(--primary)))',
    active: 'hsl(var(--primary-active, var(--primary)))',
    soft: 'hsl(var(--primary-soft, var(--accent)))',
    'soft-foreground': 'hsl(var(--primary-soft-foreground, var(--accent-foreground)))',
  },
  // Second brand accent (issue #485)
  tertiary: {
    DEFAULT: 'hsl(var(--tertiary, var(--accent-foreground)))',
    foreground: 'hsl(var(--tertiary-foreground, var(--accent)))',
    soft: 'hsl(var(--tertiary-soft, var(--accent)))',
    'soft-foreground': 'hsl(var(--tertiary-soft-foreground, var(--accent-foreground)))',
  },
  secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
  muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
  accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
  destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
  success: { DEFAULT: 'hsl(var(--success))', foreground: 'hsl(var(--success-foreground))' },
  warning: { DEFAULT: 'hsl(var(--warning))', foreground: 'hsl(var(--warning-foreground))' },
  info: { DEFAULT: 'hsl(var(--info))', foreground: 'hsl(var(--info-foreground))' },
  pending: { DEFAULT: 'hsl(var(--pending))', foreground: 'hsl(var(--pending-foreground))' },
  neutral: { DEFAULT: 'hsl(var(--neutral))', foreground: 'hsl(var(--neutral-foreground))' },
  // Extended status roles (issue #485) — default to the existing status hues
  positive: {
    DEFAULT: 'hsl(var(--positive, var(--success)))',
    foreground: 'hsl(var(--positive-foreground, var(--success-foreground)))',
  },
  caution: {
    DEFAULT: 'hsl(var(--caution, var(--warning)))',
    foreground: 'hsl(var(--caution-foreground, var(--warning-foreground)))',
  },
  done: 'hsl(var(--done, var(--info)))',
  // Ink / surface (issue #485)
  placeholder: 'hsl(var(--placeholder, var(--muted-foreground)))',
  'surface-subtle': 'hsl(var(--surface-subtle, var(--muted)))',
  border: 'hsl(var(--border))',
  'border-subtle': 'hsl(var(--border-subtle, var(--border)))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  chart: {
    1: 'hsl(var(--chart-1))',
    2: 'hsl(var(--chart-2))',
    3: 'hsl(var(--chart-3))',
    4: 'hsl(var(--chart-4))',
    5: 'hsl(var(--chart-5))',
  },
  sidebar: {
    DEFAULT: 'hsl(var(--sidebar-background))',
    foreground: 'hsl(var(--sidebar-foreground))',
    primary: 'hsl(var(--sidebar-primary))',
    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    accent: 'hsl(var(--sidebar-accent))',
    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    border: 'hsl(var(--sidebar-border))',
    ring: 'hsl(var(--sidebar-ring))',
  },
}
