/**
 * Minimal Tailwind plugin types — avoids depending on tailwindcss.
 * Consumers have tailwindcss installed; we just need the shapes for authoring.
 */

export type PluginCreator = (helpers: {
  addUtilities: (utilities: Record<string, Record<string, string | Record<string, string>>>) => void
}) => void
