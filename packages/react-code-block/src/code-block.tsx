import * as React from 'react'
import {
  createCodeBlock,
  createCodeBlockHeader,
  createCodeBlockContent,
  codeBlockVariants,
  codeBlockHeaderVariants,
  codeBlockContentVariants,
} from '@refraction-ui/code-block'
import { cn } from '@refraction-ui/shared'

export const CodeBlock = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const api = createCodeBlock()
    return (
      <div
        ref={ref}
        className={cn(codeBlockVariants(), className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)
CodeBlock.displayName = 'CodeBlock'

export const CodeBlockHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const api = createCodeBlockHeader()
    return (
      <div
        ref={ref}
        className={cn(codeBlockHeaderVariants(), className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)
CodeBlockHeader.displayName = 'CodeBlockHeader'

export const CodeBlockContent = React.forwardRef<HTMLPreElement, React.HTMLAttributes<HTMLPreElement>>(
  ({ className, ...props }, ref) => {
    const api = createCodeBlockContent()
    return (
      <pre
        ref={ref}
        className={cn(codeBlockContentVariants(), className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)
CodeBlockContent.displayName = 'CodeBlockContent'
