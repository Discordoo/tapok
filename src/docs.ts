import { ClassDoc, parseClass } from './utils/classes'
import { parseTypedef, TypedefDoc } from './utils/typedefs'
import { JSONOutput } from 'typedoc'
import DeclarationReflection = JSONOutput.DeclarationReflection

interface CodeDoc {
  classes: ClassDoc[]
  interfaces: TypedefDoc[]
  enums: TypedefDoc[]
  types: TypedefDoc[]
  functions: TypedefDoc[]
}

export function generateDocs(data: any): CodeDoc {
  const classes: ClassDoc[] = [],
    interfaces: TypedefDoc[] = [],
    enums: TypedefDoc[] = [],
    types: TypedefDoc[] = [],
    functions: TypedefDoc[] = []

  for (const c of data.children ?? []) {
    const { type, value } = parseRootElement(c)
    if (!value) continue

    switch (type) {
      case 'class':
        classes.push(value)
        break
      case 'type':
        types.push(value)
        break
      case 'enum':
        enums.push(value)
        break
      case 'interface':
        interfaces.push(value)
        break
      case 'function':
        functions.push(value)
        break
    }
  }

  return {
    classes,
    interfaces,
    types,
    enums,
    functions,
  }
}

function parseRootElement(element: DeclarationReflection) {
  switch (element.kindString) {
    case 'Class':
      return {
        type: 'class',
        value: parseClass(element),
      }
    case 'Interface':
      return {
        type: 'interface',
        value: parseTypedef(element),
      }
    case 'Type alias':
      return {
        type: 'type',
        value: parseTypedef(element),
      }
    case 'Enumeration':
      return {
        type: 'enum',
        value: parseTypedef(element),
      }
    case 'Function':
      return {
        type: 'function',
        value: parseTypedef(element)
      }
    default:
      return {}
  }
}