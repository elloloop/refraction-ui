import * as React from 'react'
import {
  createFileUpload,
  formatFileSize,
  fileUploadDropZoneVariants,
  fileUploadFileListStyles,
  fileUploadFileItemStyles,
  fileUploadProgressStyles,
  fileUploadProgressBarStyles,
  fileUploadRemoveButtonStyles,
  type FileEntry,
  type FileUploadError,
} from '@refraction-ui/file-upload'
import { cn } from '@refraction-ui/shared'

export interface FileUploadProps {
  accept?: string
  maxSize?: number
  maxFiles?: number
  multiple?: boolean
  onFilesSelected?: (files: FileEntry[]) => void
  onError?: (errors: FileUploadError[]) => void
  className?: string
  children?: React.ReactNode
}

export function FileUpload({
  accept,
  maxSize,
  maxFiles,
  multiple = false,
  onFilesSelected,
  onError,
  className,
  children,
}: FileUploadProps) {
  const [files, setFiles] = React.useState<FileEntry[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const api = React.useMemo(
    () =>
      createFileUpload({
        accept,
        maxSize,
        maxFiles,
        multiple,
        onFilesSelected: (newFiles) => {
          setFiles(newFiles)
          onFilesSelected?.(newFiles)
        },
        onError,
      }),
    [accept, maxSize, maxFiles, multiple, onFilesSelected, onError],
  )

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    }))
    if (droppedFiles.length > 0) {
      api.addFiles(droppedFiles)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    }))
    if (selectedFiles.length > 0) {
      api.addFiles(selectedFiles)
    }
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    api.removeFile(id)
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return React.createElement(
    'div',
    { className },
    // Hidden file input
    React.createElement('input', {
      ref: inputRef,
      ...api.inputProps,
      onChange: handleInputChange,
    }),
    // Drop zone
    React.createElement(
      'div',
      {
        ...api.dropZoneProps,
        className: fileUploadDropZoneVariants({
          state: isDragging ? 'dragging' : 'idle',
        }),
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        onDragEnter: handleDragEnter,
        onDragLeave: handleDragLeave,
        onDragOver: handleDragOver,
        onDrop: handleDrop,
      },
      children ??
        React.createElement(
          React.Fragment,
          null,
          React.createElement('div', { className: 'text-2xl mb-2' }, '\u{1F4C1}'),
          React.createElement(
            'p',
            { className: 'text-sm text-muted-foreground' },
            'Drag & drop files here, or click to select',
          ),
          accept &&
            React.createElement(
              'p',
              { className: 'text-xs text-muted-foreground mt-1' },
              `Accepted: ${accept}`,
            ),
          maxSize &&
            React.createElement(
              'p',
              { className: 'text-xs text-muted-foreground' },
              `Max size: ${formatFileSize(maxSize)}`,
            ),
        ),
    ),
    // File list
    files.length > 0 &&
      React.createElement(
        'div',
        { className: fileUploadFileListStyles },
        files.map((file) =>
          React.createElement(
            'div',
            { key: file.id, className: fileUploadFileItemStyles },
            React.createElement(
              'div',
              { className: 'flex-1 min-w-0' },
              React.createElement('div', { className: 'font-medium truncate' }, file.name),
              React.createElement(
                'div',
                { className: 'text-xs text-muted-foreground' },
                formatFileSize(file.size),
              ),
              file.status === 'uploading' &&
                React.createElement(
                  'div',
                  { className: cn(fileUploadProgressStyles, 'mt-1') },
                  React.createElement('div', {
                    className: fileUploadProgressBarStyles,
                    style: { width: `${file.progress}%` },
                  }),
                ),
              file.error &&
                React.createElement(
                  'div',
                  { className: 'text-xs text-destructive mt-0.5' },
                  file.error,
                ),
            ),
            React.createElement(
              'button',
              {
                type: 'button',
                className: fileUploadRemoveButtonStyles,
                onClick: (e: React.MouseEvent) => {
                  e.stopPropagation()
                  handleRemove(file.id)
                },
                'aria-label': `Remove ${file.name}`,
              },
              '\u00D7',
            ),
          ),
        ),
      ),
  )
}

FileUpload.displayName = 'FileUpload'
