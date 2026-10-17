import { MarkupTextExamples } from './examples'

const meta = { title: 'Data Display/MarkupText' }
export default meta

export const Instructions = {
  render: () => <MarkupTextExamples section="instructions" />,
}
export const Message = {
  render: () => <MarkupTextExamples section="message" />,
}
export const LinkSafety = {
  render: () => <MarkupTextExamples section="safety" />,
}
export const Alignment = {
  render: () => <MarkupTextExamples section="alignment" />,
}
