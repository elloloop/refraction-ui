import type { AccessibilityProps } from '@elloloop/shared'
import { generateId } from '@elloloop/shared'

export type FileStatus = 'pending' | 'uploading' | 'complete' | 'error'

export interface FileEntry {
  /** Unique ID for this file entry */
  id: string
  /** Original file name */
  name: string
  /** File size in bytes */
  size: number
  /** MIME type */
  type: string
  /** Upload progress 0-100 */
  progress: number
  /** Current status */
  status: FileStatus
  /** Error message if status is 'error' */
  error?: string
}

export interface FileUploadProps {
  /** Accepted file types (e.g., 'image/*,.pdf') */
  accept?: string
  /** Max file size in bytes */
  maxSize?: number
  /** Max number of files */
  maxFiles?: number
  /** Allow multiple file selection */
  multiple?: boolean
  /** Callback when files are selected/added */
  onFilesSelected?: (files: FileEntry[]) => void
  /** Callback when a validation error occurs */
  onError?: (errors: FileUploadError[]) => void
}

export interface FileUploadError {
  file: string
  code: 'type' | 'size' | 'count'
  message: string
}

export interface FileUploadState {
  files: FileEntry[]
  isDragging: boolean
}

export interface FileUploadAPI {
  /** Current state */
  state: FileUploadState
  /** Add files (validates type, size, count) */
  addFiles(files: Array<{ name: string; size: number; type: string }>): void
  /** Remove a file by ID */
  removeFile(id: string): void
  /** Update a file's progress */
  updateProgress(id: string, progress: number): void
  /** Set a file's status */
  setStatus(id: string, status: FileStatus, error?: string): void
  /** ARIA props for the drop zone */
  dropZoneProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** ARIA props for the file input */
  inputProps: Record<string, unknown>
  /** Drag event handlers (for headless use) */
  dragHandlers: {
    onDragEnter(): void
    onDragLeave(): void
    onDragOver(): void
    onDrop(): void
  }
  /** Generated IDs */
  ids: {
    dropZone: string
    input: string
    label: string
    fileList: string
  }
}

function matchesAccept(fileType: string, fileName: string, accept: string): boolean {
  if (!accept) return true
  const acceptedTypes = accept.split(',').map((t) => t.trim())
  for (const accepted of acceptedTypes) {
    if (accepted.startsWith('.')) {
      // Extension match
      if (fileName.toLowerCase().endsWith(accepted.toLowerCase())) return true
    } else if (accepted.endsWith('/*')) {
      // Wildcard MIME match (e.g., 'image/*')
      const prefix = accepted.slice(0, -2)
      if (fileType.startsWith(prefix)) return true
    } else {
      // Exact MIME match
      if (fileType === accepted) return true
    }
  }
  return false
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function createFileUpload(props: FileUploadProps = {}): FileUploadAPI {
  const {
    accept,
    maxSize,
    maxFiles,
    multiple = false,
    onFilesSelected,
    onError,
  } = props

  let files: FileEntry[] = []
  let isDragging = false

  const dropZoneId = generateId('rfr-file-upload-zone')
  const inputId = generateId('rfr-file-upload-input')
  const labelId = generateId('rfr-file-upload-label')
  const fileListId = generateId('rfr-file-upload-list')

  function addFiles(incoming: Array<{ name: string; size: number; type: string }>): void {
    const errors: FileUploadError[] = []
    const validFiles: FileEntry[] = []

    // Check count limit
    const availableSlots = maxFiles ? maxFiles - files.length : Infinity
    if (!multiple && incoming.length > 1) {
      // Only take the first file if not multiple
      incoming = [incoming[0]]
    }

    for (let i = 0; i < incoming.length; i++) {
      const file = incoming[i]

      if (validFiles.length >= availableSlots) {
        errors.push({
          file: file.name,
          code: 'count',
          message: `Maximum of ${maxFiles} files allowed`,
        })
        continue
      }

      // Validate type
      if (accept && !matchesAccept(file.type, file.name, accept)) {
        errors.push({
          file: file.name,
          code: 'type',
          message: `File type "${file.type || 'unknown'}" is not accepted`,
        })
        continue
      }

      // Validate size
      if (maxSize && file.size > maxSize) {
        errors.push({
          file: file.name,
          code: 'size',
          message: `File size ${formatFileSize(file.size)} exceeds limit of ${formatFileSize(maxSize)}`,
        })
        continue
      }

      validFiles.push({
        id: generateId('rfr-file'),
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'pending',
      })
    }

    if (errors.length > 0) {
      onError?.(errors)
    }

    if (validFiles.length > 0) {
      if (!multiple) {
        files = validFiles.slice(0, 1)
      } else {
        files = [...files, ...validFiles]
      }
      onFilesSelected?.(files)
    }
  }

  function removeFile(id: string): void {
    files = files.filter((f) => f.id !== id)
  }

  function updateProgress(id: string, progress: number): void {
    files = files.map((f) =>
      f.id === id ? { ...f, progress: Math.min(100, Math.max(0, progress)) } : f,
    )
  }

  function setStatus(id: string, status: FileStatus, error?: string): void {
    files = files.map((f) =>
      f.id === id ? { ...f, status, error, progress: status === 'complete' ? 100 : f.progress } : f,
    )
  }

  const dropZoneProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    role: 'button',
    'aria-label': 'Drop files here or click to upload',
    'aria-describedby': labelId,
    id: dropZoneId,
    tabIndex: 0,
  }

  const inputProps: Record<string, unknown> = {
    type: 'file',
    id: inputId,
    accept: accept ?? undefined,
    multiple,
    'aria-hidden': true,
    tabIndex: -1,
    style: { display: 'none' },
  }

  const dragHandlers = {
    onDragEnter() {
      isDragging = true
    },
    onDragLeave() {
      isDragging = false
    },
    onDragOver() {
      isDragging = true
    },
    onDrop() {
      isDragging = false
    },
  }

  return {
    state: {
      get files() { return files },
      get isDragging() { return isDragging },
    },
    addFiles,
    removeFile,
    updateProgress,
    setStatus,
    dropZoneProps,
    inputProps,
    dragHandlers,
    ids: {
      dropZone: dropZoneId,
      input: inputId,
      label: labelId,
      fileList: fileListId,
    },
  }
}
