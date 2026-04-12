import { FileUploadExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'
const fileUploadProps = [
  { name: 'onFilesChange', type: '(files: FileEntry[]) => void', description: 'Callback when files change.' },
  { name: 'accept', type: 'string', description: 'Accepted file types.' },
  { name: 'maxFiles', type: 'number', description: 'Maximum number of files.' },
  { name: 'maxSize', type: 'number', description: 'Maximum file size in bytes.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const usageCode = `import { FileUpload } from '@refraction-ui/react-file-upload'
export function MyComponent() {
  return <FileUpload onFilesChange={(files) => console.log(files)} accept="image/*" maxFiles={3} />
}`
export default function FileUploadPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">File Upload</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A drag and drop file upload zone with file list, progress, and validation.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/file-upload</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Drag files or click to upload. Accepts images and PDFs.</p>
        <FileUploadExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-file-upload" />
      </section>

      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->', vue: '<!-- Vue implementation pending -->' }} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={fileUploadProps} /></section>
    </div>
  )
}
