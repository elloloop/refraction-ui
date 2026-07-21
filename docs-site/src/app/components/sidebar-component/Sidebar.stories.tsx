import { Sidebar } from '@refraction-ui/react-sidebar'
import { SidebarExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Components/Sidebar' }
export default meta

export const Basic = { render: () => <SidebarExamples section="basic" /> }

export const Collapsed = {
  render: () => (
    <div className="h-[300px] relative rounded-lg border overflow-hidden">
      <Sidebar
        collapsed
        sections={[
          {
            title: 'Components',
            items: [
              { label: 'Button', href: '/components/button', icon: '🔘' },
              { label: 'Input', href: '/components/input', icon: '⌨️' },
              { label: 'Dialog', href: '/components/dialog', icon: '💬' },
            ],
          },
        ]}
        currentPath="/components/button"
        className="relative h-full"
      />
    </div>
  ),
}
