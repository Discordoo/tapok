import { JSONOutput } from 'typedoc'
import path from 'path'

export interface DocMeta {
  line: number
  file: string
  path: string
}

export function parseMeta(element: JSONOutput.DeclarationReflection): DocMeta | undefined {
  const meta = element.sources?.[0]

  if (meta) {
    return {
      line: meta.line,
      file: path.basename(meta.fileName),
      path: path.dirname(meta.fileName),
    }
  }
}