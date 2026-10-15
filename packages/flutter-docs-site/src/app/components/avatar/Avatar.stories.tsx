import { ThemeProvider } from '@refraction-ui/react-theme'
import { FlutterPreview } from '../../../components/flutter-preview'

const meta = { title: 'Data Display/Flutter Avatar' }
export default meta

export const BoundedFlutter = {
  render: () => (
    <ThemeProvider defaultMode="system">
      <FlutterPreview path="/docs/avatar" height={520} />
    </ThemeProvider>
  ),
}
