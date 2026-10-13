import type { Meta, StoryObj } from '@storybook/react'
import { HierarchyCanvasExample } from './examples'
const meta: Meta<typeof HierarchyCanvasExample> = {
  title: 'Data Display/HierarchyCanvas',
  component: HierarchyCanvasExample,
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof meta>
export const TopDown: Story = { args: { initialOrientation: 'vertical' } }
export const LeftToRight: Story = { args: { initialOrientation: 'horizontal' } }
