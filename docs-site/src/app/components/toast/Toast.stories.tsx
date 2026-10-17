import { Toaster } from '@refraction-ui/react-toast'
import { ToastExamples, ToastActionExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Feedback/Toast' }
export default meta

export const Default = { render: () => <ToastExamples /> }

export const TitleAndAction = {
  render: () => (
    <>
      <ToastActionExamples />
      <Toaster />
    </>
  ),
}
