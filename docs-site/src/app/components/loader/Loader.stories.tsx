import { LoaderExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Feedback/Loader' }
export default meta

export const Spinners = { render: () => <LoaderExamples section="spinners" /> }
export const Sizes = { render: () => <LoaderExamples section="sizes" /> }
export const InButtons = { render: () => <LoaderExamples section="buttons" /> }
export const LoadingBars = { render: () => <LoaderExamples section="bars" /> }
export const PageTransition = {
  render: () => <LoaderExamples section="page-transition" />,
}
export const Overlay = { render: () => <LoaderExamples section="overlay" /> }
export const DelayedLoading = {
  render: () => <LoaderExamples section="delayed" />,
}
