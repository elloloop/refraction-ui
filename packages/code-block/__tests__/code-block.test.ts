import { describe, it, expect } from 'vitest'
import {
  createCodeBlock,
  createCodeBlockHeader,
  createCodeBlockContent,
} from '../src/index.js'

describe('code-block core — data-slot contract', () => {
  it('exposes the code-block slot family', () => {
    expect({
      root: createCodeBlock().dataAttributes['data-slot'],
      header: createCodeBlockHeader().dataAttributes['data-slot'],
      content: createCodeBlockContent().dataAttributes['data-slot'],
    }).toEqual({
      root: 'code-block',
      header: 'code-block-header',
      content: 'code-block-content',
    })
  })
})
