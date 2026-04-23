export interface CodeBlockAPI {
  dataAttributes: Record<string, string>
}

export function createCodeBlock(): CodeBlockAPI {
  return { dataAttributes: { 'data-slot': 'code-block' } }
}

export function createCodeBlockHeader(): CodeBlockAPI {
  return { dataAttributes: { 'data-slot': 'code-block-header' } }
}

export function createCodeBlockContent(): CodeBlockAPI {
  return { dataAttributes: { 'data-slot': 'code-block-content' } }
}
