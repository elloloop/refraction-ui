// Reuse the React Storybook's theme tokens + Tailwind layer.
import '../.storybook/tokens.css'
import '../.storybook/preview.css'

const preview = {
  parameters: {
    layout: 'padded',
  },
}

export default preview
