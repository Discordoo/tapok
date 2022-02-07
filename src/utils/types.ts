import { JSONOutput } from 'typedoc'
import { inspect } from 'util'
import DeclarationReflection = JSONOutput.DeclarationReflection

function isArrayType(value: any): value is JSONOutput.ArrayType {
  return typeof value == 'object' && value.type == 'array'
}
function isConditionalType(value: any): value is JSONOutput.ConditionalType {
  return typeof value == 'object' && value.type == 'conditional'
}
function isIndexedAccessType(value: any): value is JSONOutput.IndexedAccessType {
  return typeof value == 'object' && value.type == 'indexedAccess'
}
function isInferredType(value: any): value is JSONOutput.InferredType {
  return typeof value == 'object' && value.type == 'inferred'
}
function isIntersectionType(value: any): value is JSONOutput.IntersectionType {
  return typeof value == 'object' && value.type == 'intersection'
}
function isIntrinsicType(value: any): value is JSONOutput.IntrinsicType {
  return typeof value == 'object' && value.type == 'intrinsic'
}
function isPredicateType(value: any): value is JSONOutput.PredicateType {
  return typeof value == 'object' && value.type == 'predicate'
}
function isReferenceType(value: any): value is JSONOutput.ReferenceType {
  return typeof value == 'object' && value.type == 'reference'
}
function isReflectionType(value: any): value is JSONOutput.ReflectionType {
  return typeof value == 'object' && value.type == 'reflection'
}
function isLiteralType(value: any): value is JSONOutput.LiteralType {
  return typeof value == 'object' && value.type == 'literal'
}
function isTemplateLiteralType(value: any): value is JSONOutput.TemplateLiteralType {
  return typeof value == 'object' && value.type === 'template-literal'
}
function isTupleType(value: any): value is JSONOutput.TupleType {
  return typeof value == 'object' && value.type == 'tuple'
}
function isTypeOperatorType(value: any): value is JSONOutput.TypeOperatorType {
  return typeof value == 'object' && value.type == 'typeOperator'
}
function isUnionType(value: any): value is JSONOutput.UnionType {
  return typeof value == 'object' && value.type == 'union'
}
function isOptionalType(value: any): value is JSONOutput.OptionalType {
  return typeof value == 'object' && value.type === 'optional'
}
function isMappedType(value: any): value is JSONOutput.MappedType {
  return typeof value == 'object' && value.type === 'mapped'
}
function isUnknownType(value: any): value is JSONOutput.UnknownType {
  return typeof value == 'object' && value.type == 'unknown'
}

interface QueryType {
  type: 'query'
  queryType: JSONOutput.SomeType
}
function isQueryType(value: any): value is QueryType {
  return typeof value == 'object' && value.type == 'query'
}

export const typeUtil = {
  isArrayType,
  isConditionalType,
  isIndexedAccessType,
  isInferredType,
  isIntersectionType,
  isIntrinsicType,
  isPredicateType,
  isReferenceType,
  isReflectionType,
  isLiteralType,
  isTemplateLiteralType,
  isTupleType,
  isTypeOperatorType,
  isUnionType,
  isUnknownType
}

export function parseTypeSimple(t: JSONOutput.SomeType | JSONOutput.TemplateLiteralType | JSONOutput.MappedType): string {
  const parseType = parseTypeSimple

  if (isArrayType(t)) {
    return `Array<${parseType(t.elementType)}>`
  }
  if (isConditionalType(t)) {
    const { checkType, extendsType, trueType, falseType } = t
    return `${parseType(checkType)} extends ${parseType(extendsType)} ? ${parseType(
      trueType
    )} : ${parseType(falseType)}`
  }
  if (isIndexedAccessType(t)) {
    return `${parseType(t.objectType)}[${parseType(t.indexType)}]`
  }
  if (isIntersectionType(t)) {
    return t.types.map(parseType).join(' & ')
  }
  if (isPredicateType(t)) {
    return (
      (t.asserts ? 'asserts ' : '') +
      t.name +
      (t.targetType ? ` is ${parseType(t.targetType)}` : '')
    )
  }
  if (isReferenceType(t)) {
    return t.name + (t.typeArguments ? `<${t.typeArguments.map(parseType).join(', ')}>` : '')
  }
  if (isReflectionType(t)) {
    const obj = {} as Record<string, any>

    const { children, signatures } = t.declaration as DeclarationReflection

    // This is run when we're parsing interface-like declaration
    if (children && children.length > 0) {
      for (const child of children) {
        const { type } = child
        if (type) obj[child.name] = parseType(type as any)
      }
      return `{\n${Object.entries(obj)
        .map(([key, value]) => `${key}: ${value}`)
        .join(',\n')}\n}`
    }

    // This is run if we're parsing a function type
    if (signatures && signatures.length > 0) {
      const s = signatures[0],
        params = s.parameters?.map((p) => `${p.name}: ${p.type ? parseType(p.type as any) : 'unknown'}`)
      return `(${params?.join(', ') || '...args: unknown[]'}) => ${
        s.type ? parseType(s.type) : 'unknown'
      }`
    }

    return '{}'
  }
  if (isLiteralType(t)) {
    if (typeof t.value == 'string') return `'${t.value}'`
    return t.value + ''
  }
  if (isTupleType(t)) {
    return `[${(t.elements || []).map(parseType).join(', ')}]`
  }
  if (isTypeOperatorType(t)) {
    return `${t.operator} ${parseType(t.target)}`
  }
  if (isUnionType(t)) {
    return t.types
      .map(parseType as any)
      .filter((s: any) => !!s && s.trim().length > 0)
      .join(' | ')
  }
  if (isQueryType(t)) {
    return `typeof ${parseType(t.queryType)}`
  }
  if (isInferredType(t) || isIntrinsicType(t) || isUnknownType(t)) {
    return t.name
  }
  if (isTemplateLiteralType(t)) {
    let result = t.head

    for (let [ tp, str ] of t.tail) {
      result += `${parseType(tp)}${str}`
    }

    // console.log('template literal type:', result)
    return '`' + result + '`'
  }
  if (isOptionalType(t)) {
    return parseType(t.elementType) + '?'
  }
  if (isMappedType(t)) {
    return '{ ' +
      `${ t.readonlyModifier === '+' ? 'readonly ' : '' }` +
      `[${ t.parameter } in ${ parseType(t.parameterType) }]${ t.optionalModifier === '+' ? '?' : '' }` +
      `: ${ parseType(t.templateType) } }`
  }
  console.log('an undecipherable type was found:', inspect(t, { depth: 10 }))
  return 'unknown'
}

const splitVarName = (str: string) => {
  const res: string[][] = []
  let currGroup: string[] = [],
    currStr = ''

  const isASymbol = (char: string) => '-!$%^&*()+|~=`{}[]:;<>?,. '.includes(char) // string quotes and _ excluded

  for (const char of str) {
    const currentlyInASymbolSection = isASymbol(currStr[0]),
      charIsASymbol = isASymbol(char)

    if (currStr.length && currentlyInASymbolSection != charIsASymbol) {
      currGroup.push(currStr)
      currStr = char

      if (!charIsASymbol) {
        if (currGroup[0] === 'is' && currGroup[1] === ' ') {
          res[res.length - 1][0] += ' is'
        } else {
          res.push(currGroup)
        }
        currGroup = []
      }
    } else {
      currStr += char
    }
  }
  currGroup.push(currStr)
  res.push(currGroup)

  return res
}

export type DocType = string[][] | string[][][]
export function parseType(t: JSONOutput.SomeType, isOptional?: boolean): DocType {
  const res = parseTypeSimple(t)

  if (isOptional) {
    return [ [ [ 'undefined', ' | ' ], ...splitVarName(res) ] ]
  } else {
    return [ splitVarName(res) ]
  }
}

export declare function assert<T>(val: any): asserts val is T