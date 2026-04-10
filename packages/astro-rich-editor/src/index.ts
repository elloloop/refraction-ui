export { default as RichEditor } from './RichEditor.astro'

// Re-export core types and utilities
export type {
  BlockType,
  HeadingLevel,
  MarkType,
  Mark,
  Block,
  Document,
  EditorConfig,
  EditorAPI,
  EditorState,
} from '@refraction-ui/rich-editor'

export {
  createEditor,
  createDocument,
  createBlock,
  toMarkdown,
  fromMarkdown,
  toHTML,
  fromHTML,
  toPlainText,
} from '@refraction-ui/rich-editor'
