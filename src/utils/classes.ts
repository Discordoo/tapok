import path from 'path'
import { JSONOutput } from 'typedoc'
import DeclarationReflection = JSONOutput.DeclarationReflection
import { DocType, parseType, parseTypeSimple } from './types'
import { DocMeta, parseMeta } from './meta'

export interface ClassDoc {
  name: string
  description?: string | undefined
  see?: string[] | undefined
  extends?: DocType | undefined
  implements?: DocType | undefined
  access?: 'private' | undefined
  abstract?: boolean | undefined
  deprecated?: boolean | undefined
  construct?: ClassMethodDoc | undefined
  props?: ClassPropDoc[] | undefined
  methods?: ClassMethodDoc[] | undefined
  events?: ClassEventDoc[] | undefined
  meta?: DocMeta | undefined
}

export function parseClass(element: DeclarationReflection): ClassDoc {
  const extended = element.extendedTypes?.[0]
  const implemented = element.implementedTypes?.[0]
  const construct = element.children?.find((c) => c.kindString === 'Constructor')
  // Ignore setter-only accessors (the typings still exist, but the docs don't show them)
  const props = element.children?.filter(
    (c) => c.kindString === 'Property' || (c.kindString === 'Accessor' && c.getSignature?.length),
  )
  const methods = element.children?.filter((c) => c.kindString === 'Method')
  const events = element.children?.filter((c) => c.kindString === 'Event')

  const meta = parseMeta(element)

  return {
    name: element.name === 'default' ? path.parse(meta?.file ?? 'default').name : element.name,
    description: element.comment?.shortText?.trim(),
    see: element.comment?.tags?.filter((t) => t.tag === 'see')
      .map((t) => t.text.trim()),
    extends: extended ? parseType(extended) : undefined,
    implements: implemented ? parseType(implemented) : undefined,
    access:
      element.flags.isPrivate
      || element.comment?.tags?.some((t) => t.tag === 'private' || t.tag === 'internal')
        ? 'private'
        : undefined,
    abstract: element.comment?.tags?.some((t) => t.tag === 'abstract') || element.flags?.isAbstract,
    deprecated: element.comment?.tags?.some((t) => t.tag === 'deprecated'),
    construct: construct ? parseClassMethod(construct) : undefined,
    props: props && props.length > 0 ? props.map(parseClassProp) : undefined,
    methods: methods && methods.length > 0 ? methods.map(parseClassMethod) : undefined,
    events: events && events.length > 0 ? events.map(parseClassEvent) : undefined,
    meta,
  }
}

interface ClassPropDoc {
  name: string
  description?: string | undefined
  see?: string[] | undefined
  scope?: 'static' | undefined
  access?: 'private' | undefined
  readonly?: boolean | undefined
  nullable?: never | undefined // it would already be in the type
  abstract?: boolean | undefined
  deprecated?: boolean | undefined
  default?: string | boolean | number | undefined
  type?: DocType | undefined
  props?: never | undefined // prefer using a type reference (like a dedicated instance) instead of documenting using @property tags
  meta?: DocMeta | undefined
}

function parseClassProp(element: DeclarationReflection): ClassPropDoc {
  const base: ClassPropDoc = {
    name: element.name,
    description: element.comment?.shortText?.trim(),
    see: element.comment?.tags?.filter((t) => t.tag === 'see')
      .map((t) => t.text.trim()),
    scope: element.flags.isStatic ? 'static' : undefined,
    access:
      element.flags.isPrivate
      || element.comment?.tags?.some((t) => t.tag === 'private' || t.tag === 'internal')
        ? 'private'
        : undefined,
    readonly: element.flags.isReadonly,
    abstract: element.comment?.tags?.some((t) => t.tag === 'abstract'),
    deprecated: element.comment?.tags?.some((t) => t.tag === 'deprecated'),
    default:
      element.comment?.tags?.find((t) => t.tag === 'default')?.text?.trim() ??
      (element.defaultValue === '...' ? undefined : element.defaultValue),
    type: element.type ? parseType(element.type as any, element.flags.isOptional) : undefined,
    meta: parseMeta(element),
  }

  if (element.kindString === 'Accessor') {
    // I'll just ignore set signatures: if there's a getter, I'll take the docs from that
    // If a set signature is not present at all, I'll mark the prop as readonly.

    const getter = element.getSignature?.[0]
    const hasSetter = Boolean(element.setSignature?.length)
    const res = { ...base }

    if (!getter) {
      // This should never happen, it should be avoided before this function is called.
      throw new Error("Can't parse accessor without getter.")
    }

    if (!hasSetter) res.readonly = true

    return {
      ...res,
      description: getter.comment?.shortText?.trim(),
      see: getter.comment?.tags?.filter((t) => t.tag === 'see')
        .map((t) => t.text.trim()),
      access:
        getter.flags.isPrivate
        || getter.comment?.tags?.some((t) => t.tag === 'private' || t.tag === 'internal')
          ? 'private'
          : undefined,
      readonly: res.readonly ?? !hasSetter,
      abstract: getter.comment?.tags?.some((t) => t.tag === 'abstract'),
      deprecated: getter.comment?.tags?.some((t) => t.tag === 'deprecated'),
      type: getter.type ? parseType(getter.type) : undefined,
      default:
        res.default ??
        getter.comment?.tags?.find((t) => t.tag === 'default')?.text?.trim() ??
        // @ts-ignore
        getter.defaultValue
    }
  }

  return base
}

interface ClassMethodDoc {
  name: string
  description?: string | undefined
  see?: string[] | undefined
  scope?: 'static' | undefined
  access?: 'private' | undefined
  inherits?: never | undefined // let's just don't
  inherited?: never | undefined // let's just don't
  implements?: never | undefined // let's just don't
  examples?: string[] | undefined
  abstract?: boolean | undefined
  deprecated?: boolean | undefined
  emits?: string[] | undefined
  throws?: never | undefined // let's just don't
  params?:
    | {
    name: string
    description?: string | undefined
    optional?: boolean | undefined
    default?: string | boolean | number | undefined
    variable?: never | undefined // it would already be in the type
    nullable?: never | undefined // it would already be in the type
    type?: DocType | undefined
  }[]
    | undefined
  async?: never | undefined // it would already be in the type
  generator?: never | undefined // not used
  returns?: DocType | undefined
  returnsDescription?: string | undefined
  meta?: DocMeta | undefined
}

export function parseClassMethod(element: DeclarationReflection): ClassMethodDoc {
  const signature = (element.signatures ?? [])[0] || element

  return {
    name: element.name,
    description: signature.comment?.shortText?.trim(),
    see: signature.comment?.tags?.filter((t) => t.tag === 'see').map((t) => t.text.trim()),
    scope: element.flags.isStatic ? 'static' : undefined,
    access:
      element.flags.isPrivate || signature.comment?.tags?.some((t) => t.tag === 'private' || t.tag === 'internal')
        ? 'private'
        : undefined,
    examples: signature.comment?.tags?.filter((t) => t.tag === 'example').map((t) => t.text.trim()),
    abstract: signature.comment?.tags?.some((t) => t.tag === 'abstract'),
    deprecated: signature.comment?.tags?.some((t) => t.tag === 'deprecated'),
    emits: signature.comment?.tags?.filter((t) => t.tag === 'emits').map((t) => t.text.trim()),
    params: signature.parameters ? signature.parameters.map(parseParam) : undefined,
    returns: signature.type ? parseType(signature.type) : undefined,
    returnsDescription: signature.comment?.returns?.trim(),
    meta: parseMeta(element),
  }
}

export type ClassMethodParamDoc = Exclude<ClassMethodDoc['params'], undefined>[number]

export function parseParam(param: DeclarationReflection): ClassMethodParamDoc {
  return {
    name: param.name,
    description: param.comment?.shortText?.trim() ?? param.comment?.text?.trim(),
    optional: param.flags.isOptional ?? typeof param.defaultValue != 'undefined',
    default:
      param.comment?.tags?.find((t) => t.tag === 'default')?.text?.trim() ??
      (param.defaultValue === '...' ? undefined : param.defaultValue),
    type: param.type ? parseType(param.type as any) : undefined,
  }
}

interface ClassEventDoc {
  name: string
  description?: string | undefined
  see?: string[] | undefined
  deprecated?: boolean | undefined
  params?:
    | {
    name: string
    description?: string | undefined
    optional?: boolean | undefined
    default?: string | boolean | number | undefined
    variable?: never | undefined // it would already be in the type
    nullable?: never | undefined // it would already be in the type
    type?: DocType | undefined
  }[]
    | undefined
  meta?: DocMeta | undefined
}

function parseClassEvent(element: DeclarationReflection): ClassEventDoc {
  return parseClassMethod(element)
}