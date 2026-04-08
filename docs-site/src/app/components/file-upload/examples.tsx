'use client'
import { FileUpload } from '@refraction-ui/react-file-upload'
interface FileUploadExamplesProps { section: 'basic' }
export function FileUploadExamples({ section }: FileUploadExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-md">
          <FileUpload onFilesChange={(files) => console.log(files)} accept="image/*,.pdf" maxFiles={5} maxSize={10 * 1024 * 1024} />
        </div>
      </div>
    )
  }
  return null
}
