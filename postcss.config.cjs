// Used by Storybook's Vite builder. Tailwind is scoped to the Storybook config
// so it does not affect package builds (those ship plain class strings).
module.exports = {
  plugins: {
    tailwindcss: { config: './.storybook/tailwind.config.cjs' },
    autoprefixer: {},
  },
}
