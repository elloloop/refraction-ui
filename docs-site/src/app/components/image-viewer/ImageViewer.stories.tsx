import { ImageViewerExamples } from './examples'

// Curated from the docs-site examples (real props/content).
const meta = { title: 'Overlays/ImageViewer' }
export default meta

export const Basic = { render: () => <ImageViewerExamples section="basic" /> }
export const Gallery = { render: () => <ImageViewerExamples section="gallery" /> }
export const Localised = { render: () => <ImageViewerExamples section="localised" /> }
