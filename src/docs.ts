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
  variables: TypedefDoc[]
}

export function generateDocs(data: any): CodeDoc {
  const classes: ClassDoc[] = [],
    interfaces: TypedefDoc[] = [],
    enums: TypedefDoc[] = [],
    types: TypedefDoc[] = [],
    functions: TypedefDoc[] = [],
    variables: TypedefDoc[] = []

  docs(data.children)

  function docs(d) {
    for (const c of d ?? []) {
      const parsed = parseRootElement(c)
      if (!parsed) continue

      if (Array.isArray(parsed)) {
        docs(parsed)
        continue
      }

      const { value, type } = parsed
      if (!value) {
        console.log('Unknown element warning', parsed)
        continue
      }

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
        case 'variable':
          variables.push(value)
          break
      }
    }
  }

  return {
    classes,
    interfaces,
    types,
    enums,
    functions,
    variables,
  }
}

export function parseDescription(e: JSONOutput.DeclarationReflection | undefined): string | undefined {
  if (!e) return undefined

  const short = e.comment?.shortText?.trim(),
    long = e.comment?.text?.trim()

  switch (true) {
    case short !== undefined && long !== undefined: {
      if (short !== long) return short + '\n' + long
      return short
    }
    case short !== undefined && long === undefined:
      return short
    case long !== undefined && short === undefined:
      return long
    default:
      return undefined
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
    case 'Variable':
      return {
        type: 'variable',
        value: parseTypedef(element)
      }
    case 'Namespace':
      return element.children?.map(v => v.isNonExported = true)
    default:
      return {}
  }
}