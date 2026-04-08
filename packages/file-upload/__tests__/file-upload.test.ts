import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetIdCounter } from '@refraction-ui/shared'
import { createFileUpload, formatFileSize } from '../src/file-upload.js'
import {
  fileUploadDropZoneVariants,
  fileUploadFileListStyles,
  fileUploadFileItemStyles,
  fileUploadProgressStyles,
  fileUploadProgressBarStyles,
  fileUploadRemoveButtonStyles,
} from '../src/file-upload.styles.js'

beforeEach(() => {
  resetIdCounter()
})

describe('createFileUpload - initial state', () => {
  it('starts with empty files', () => {
    const api = createFileUpload()
    expect(api.state.files).toEqual([])
  })

  it('starts with isDragging false', () => {
    const api = createFileUpload()
    expect(api.state.isDragging).toBe(false)
  })
})

describe('addFiles', () => {
  it('adds valid files', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ onFilesSelected, multiple: true })
    api.addFiles([{ name: 'test.txt', size: 100, type: 'text/plain' }])
    expect(onFilesSelected).toHaveBeenCalled()
    const files = onFilesSelected.mock.calls[0][0]
    expect(files).toHaveLength(1)
    expect(files[0].name).toBe('test.txt')
  })

  it('assigns unique IDs to files', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ onFilesSelected, multiple: true })
    api.addFiles([
      { name: 'a.txt', size: 100, type: 'text/plain' },
      { name: 'b.txt', size: 200, type: 'text/plain' },
    ])
    const files = onFilesSelected.mock.calls[0][0]
    expect(files[0].id).not.toBe(files[1].id)
  })

  it('sets initial status to pending', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ onFilesSelected })
    api.addFiles([{ name: 'test.txt', size: 100, type: 'text/plain' }])
    const files = onFilesSelected.mock.calls[0][0]
    expect(files[0].status).toBe('pending')
  })

  it('sets initial progress to 0', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ onFilesSelected })
    api.addFiles([{ name: 'test.txt', size: 100, type: 'text/plain' }])
    const files = onFilesSelected.mock.calls[0][0]
    expect(files[0].progress).toBe(0)
  })
})

describe('type validation', () => {
  it('rejects files with wrong type', () => {
    const onError = vi.fn()
    const api = createFileUpload({ accept: 'image/*', onError })
    api.addFiles([{ name: 'test.txt', size: 100, type: 'text/plain' }])
    expect(onError).toHaveBeenCalled()
    expect(onError.mock.calls[0][0][0].code).toBe('type')
  })

  it('accepts matching MIME type', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ accept: 'image/*', onFilesSelected })
    api.addFiles([{ name: 'test.png', size: 100, type: 'image/png' }])
    expect(onFilesSelected).toHaveBeenCalled()
  })

  it('accepts by extension', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ accept: '.pdf', onFilesSelected })
    api.addFiles([{ name: 'test.pdf', size: 100, type: 'application/pdf' }])
    expect(onFilesSelected).toHaveBeenCalled()
  })

  it('accepts exact MIME type', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ accept: 'application/json', onFilesSelected })
    api.addFiles([{ name: 'data.json', size: 100, type: 'application/json' }])
    expect(onFilesSelected).toHaveBeenCalled()
  })

  it('accepts any type when accept is not set', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ onFilesSelected })
    api.addFiles([{ name: 'test.xyz', size: 100, type: 'application/octet-stream' }])
    expect(onFilesSelected).toHaveBeenCalled()
  })

  it('accepts comma-separated types', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ accept: 'image/*,.pdf', onFilesSelected })
    api.addFiles([{ name: 'test.pdf', size: 100, type: 'application/pdf' }])
    expect(onFilesSelected).toHaveBeenCalled()
  })
})

describe('size validation', () => {
  it('rejects files exceeding maxSize', () => {
    const onError = vi.fn()
    const api = createFileUpload({ maxSize: 1000, onError })
    api.addFiles([{ name: 'big.txt', size: 2000, type: 'text/plain' }])
    expect(onError).toHaveBeenCalled()
    expect(onError.mock.calls[0][0][0].code).toBe('size')
  })

  it('accepts files within maxSize', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ maxSize: 1000, onFilesSelected })
    api.addFiles([{ name: 'small.txt', size: 500, type: 'text/plain' }])
    expect(onFilesSelected).toHaveBeenCalled()
  })

  it('accepts any size when maxSize is not set', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ onFilesSelected })
    api.addFiles([{ name: 'huge.txt', size: 999999999, type: 'text/plain' }])
    expect(onFilesSelected).toHaveBeenCalled()
  })

  it('error message includes size info', () => {
    const onError = vi.fn()
    const api = createFileUpload({ maxSize: 1000, onError })
    api.addFiles([{ name: 'big.txt', size: 2000, type: 'text/plain' }])
    expect(onError.mock.calls[0][0][0].message).toContain('exceeds')
  })
})

describe('count validation', () => {
  it('rejects files exceeding maxFiles', () => {
    const onError = vi.fn()
    const api = createFileUpload({ maxFiles: 1, multiple: true, onError })
    api.addFiles([
      { name: 'a.txt', size: 100, type: 'text/plain' },
      { name: 'b.txt', size: 100, type: 'text/plain' },
    ])
    expect(onError).toHaveBeenCalled()
    expect(onError.mock.calls[0][0][0].code).toBe('count')
  })

  it('accepts files within maxFiles limit', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ maxFiles: 3, multiple: true, onFilesSelected })
    api.addFiles([
      { name: 'a.txt', size: 100, type: 'text/plain' },
      { name: 'b.txt', size: 100, type: 'text/plain' },
    ])
    expect(onFilesSelected).toHaveBeenCalled()
    expect(onFilesSelected.mock.calls[0][0]).toHaveLength(2)
  })
})

describe('multiple mode', () => {
  it('only takes first file when multiple is false', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ multiple: false, onFilesSelected })
    api.addFiles([
      { name: 'a.txt', size: 100, type: 'text/plain' },
      { name: 'b.txt', size: 100, type: 'text/plain' },
    ])
    expect(onFilesSelected).toHaveBeenCalled()
    expect(onFilesSelected.mock.calls[0][0]).toHaveLength(1)
    expect(onFilesSelected.mock.calls[0][0][0].name).toBe('a.txt')
  })

  it('allows multiple files when multiple is true', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ multiple: true, onFilesSelected })
    api.addFiles([
      { name: 'a.txt', size: 100, type: 'text/plain' },
      { name: 'b.txt', size: 100, type: 'text/plain' },
    ])
    expect(onFilesSelected.mock.calls[0][0]).toHaveLength(2)
  })
})

describe('removeFile', () => {
  it('removes a file by ID', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ onFilesSelected })
    api.addFiles([{ name: 'test.txt', size: 100, type: 'text/plain' }])
    const fileId = onFilesSelected.mock.calls[0][0][0].id
    api.removeFile(fileId)
    expect(api.state.files.find((f) => f.id === fileId)).toBeUndefined()
  })
})

describe('updateProgress', () => {
  it('updates file progress', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ onFilesSelected })
    api.addFiles([{ name: 'test.txt', size: 100, type: 'text/plain' }])
    const fileId = onFilesSelected.mock.calls[0][0][0].id
    api.updateProgress(fileId, 50)
    const file = api.state.files.find((f) => f.id === fileId)
    expect(file?.progress).toBe(50)
  })

  it('clamps progress to 0-100', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ onFilesSelected })
    api.addFiles([{ name: 'test.txt', size: 100, type: 'text/plain' }])
    const fileId = onFilesSelected.mock.calls[0][0][0].id
    api.updateProgress(fileId, 150)
    const file = api.state.files.find((f) => f.id === fileId)
    expect(file?.progress).toBe(100)
  })
})

describe('setStatus', () => {
  it('updates file status', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ onFilesSelected })
    api.addFiles([{ name: 'test.txt', size: 100, type: 'text/plain' }])
    const fileId = onFilesSelected.mock.calls[0][0][0].id
    api.setStatus(fileId, 'uploading')
    const file = api.state.files.find((f) => f.id === fileId)
    expect(file?.status).toBe('uploading')
  })

  it('sets progress to 100 on complete', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ onFilesSelected })
    api.addFiles([{ name: 'test.txt', size: 100, type: 'text/plain' }])
    const fileId = onFilesSelected.mock.calls[0][0][0].id
    api.setStatus(fileId, 'complete')
    const file = api.state.files.find((f) => f.id === fileId)
    expect(file?.progress).toBe(100)
  })

  it('sets error message on error status', () => {
    const onFilesSelected = vi.fn()
    const api = createFileUpload({ onFilesSelected })
    api.addFiles([{ name: 'test.txt', size: 100, type: 'text/plain' }])
    const fileId = onFilesSelected.mock.calls[0][0][0].id
    api.setStatus(fileId, 'error', 'Upload failed')
    const file = api.state.files.find((f) => f.id === fileId)
    expect(file?.status).toBe('error')
    expect(file?.error).toBe('Upload failed')
  })
})

describe('formatFileSize', () => {
  it('formats 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 B')
  })

  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B')
  })

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB')
  })

  it('formats megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB')
  })

  it('formats gigabytes', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB')
  })
})

describe('drag handlers', () => {
  it('onDragEnter sets isDragging', () => {
    const api = createFileUpload()
    api.dragHandlers.onDragEnter()
    expect(api.state.isDragging).toBe(true)
  })

  it('onDragLeave clears isDragging', () => {
    const api = createFileUpload()
    api.dragHandlers.onDragEnter()
    api.dragHandlers.onDragLeave()
    expect(api.state.isDragging).toBe(false)
  })

  it('onDrop clears isDragging', () => {
    const api = createFileUpload()
    api.dragHandlers.onDragEnter()
    api.dragHandlers.onDrop()
    expect(api.state.isDragging).toBe(false)
  })

  it('onDragOver sets isDragging', () => {
    const api = createFileUpload()
    api.dragHandlers.onDragOver()
    expect(api.state.isDragging).toBe(true)
  })
})

describe('ARIA props', () => {
  it('provides drop zone ARIA props', () => {
    const api = createFileUpload()
    expect(api.dropZoneProps.role).toBe('button')
    expect(api.dropZoneProps['aria-label']).toContain('upload')
    expect(api.dropZoneProps.tabIndex).toBe(0)
  })

  it('provides input props', () => {
    const api = createFileUpload()
    expect(api.inputProps.type).toBe('file')
    expect(api.inputProps['aria-hidden']).toBe(true)
    expect(api.inputProps.tabIndex).toBe(-1)
  })

  it('input props reflect accept', () => {
    const api = createFileUpload({ accept: 'image/*' })
    expect(api.inputProps.accept).toBe('image/*')
  })

  it('input props reflect multiple', () => {
    const api = createFileUpload({ multiple: true })
    expect(api.inputProps.multiple).toBe(true)
  })
})

describe('IDs', () => {
  it('generates unique IDs', () => {
    const api1 = createFileUpload()
    const api2 = createFileUpload()
    expect(api1.ids.dropZone).not.toBe(api2.ids.dropZone)
    expect(api1.ids.input).not.toBe(api2.ids.input)
  })

  it('has all required ID fields', () => {
    const api = createFileUpload()
    expect(api.ids.dropZone).toBeDefined()
    expect(api.ids.input).toBeDefined()
    expect(api.ids.label).toBeDefined()
    expect(api.ids.fileList).toBeDefined()
  })
})

describe('styles', () => {
  it('exports drop zone variants', () => {
    const idle = fileUploadDropZoneVariants({ state: 'idle' })
    expect(idle).toContain('border-dashed')
  })

  it('exports dragging state', () => {
    const dragging = fileUploadDropZoneVariants({ state: 'dragging' })
    expect(dragging).toContain('border-primary')
  })

  it('exports file list styles', () => {
    expect(fileUploadFileListStyles).toContain('mt-4')
  })

  it('exports file item styles', () => {
    expect(fileUploadFileItemStyles).toContain('flex')
  })

  it('exports progress styles', () => {
    expect(fileUploadProgressStyles).toContain('rounded')
  })
})
