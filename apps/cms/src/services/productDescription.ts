type LexicalNode = {
  type?: unknown
  text?: unknown
  children?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isLexicalDocument(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && isRecord(value.root) && value.root.type === 'root'
}

export class ProductDescriptionError extends Error {
  constructor(message = 'Product description must be plain text or a rich text document.') {
    super(message)
    this.name = 'ProductDescriptionError'
  }
}

export function normalizeProductDescription(value: unknown): Record<string, unknown> | null {
  if (value == null || value === '') return null

  if (typeof value === 'string') {
    if (!value.trim()) return null
    if (value.length > 10000) {
      throw new ProductDescriptionError('Full description cannot exceed 10,000 characters.')
    }

    try {
      const parsed: unknown = JSON.parse(value)
      if (isLexicalDocument(parsed)) return parsed
    } catch {
      // Plain text is stored in the CMS rich-text field as simple paragraphs.
    }

    return {
      root: {
        children: value.replace(/\r\n?/g, '\n').split('\n').map((line) => ({
          children: line
            ? [{
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: line,
                type: 'text',
                version: 1,
              }]
            : [],
          direction: null,
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        })),
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    }
  }

  if (isRecord(value)) return value
  throw new ProductDescriptionError()
}

export function productDescriptionToPlainText(value: unknown): string {
  let document = value
  if (typeof document === 'string') {
    const plainText = document
    try {
      document = JSON.parse(document)
    } catch {
      return plainText
    }
  }
  if (!isLexicalDocument(document)) return ''

  function getNodeText(node: LexicalNode): string {
    if (node.type === 'text') return typeof node.text === 'string' ? node.text : ''
    if (node.type === 'linebreak') return '\n'
    if (!Array.isArray(node.children)) return ''
    return node.children.map((child) =>
      isRecord(child) ? getNodeText(child as LexicalNode) : '',
    ).join('')
  }

  const root = document.root as Record<string, unknown>
  if (!Array.isArray(root.children)) return ''
  return root.children
    .map((child) => isRecord(child) ? getNodeText(child as LexicalNode) : '')
    .join('\n')
}
