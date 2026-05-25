import * as React from 'react'
import type { Preview } from '@storybook/react'
import './tokens.css'
import './preview.css'
import { ToastProvider } from '@refraction-ui/react-toast'

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
  },
  // Provide common context so provider-dependent examples (e.g. Toast) render.
  decorators: [(Story) => <ToastProvider><Story /></ToastProvider>],
}

export default preview
