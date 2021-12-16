import { ClassMethodParamDoc } from './classes'
import { DocType, parseType, typeUtil } from './types'
import { DocMeta, parseMeta } from './meta'
import { JSONOutput } from 'typedoc'
import DeclarationReflection = JSONOutput.DeclarationReflection

export interface TypedefDoc {
  name: string;
  description?: string | undefined;
  see?: string[] | undefined;
  access?: 'private' | undefined;
  deprecated?: boolean | undefined;
  type?: DocType | undefined;
  props?: ClassMethodParamDoc[] | undefined;
  params?: ClassMethodParamDoc[] | undefined;
  returns?: DocType | undefined;
  returnsDescription?: string | undefined;
  meta?: DocMeta | undefined;
}

export function parseTypedef(element: DeclarationReflection): TypedefDoc {
  const baseReturn: TypedefDoc = {
    name: element.name,
    description: element.comment?.shortText?.trim(),
    see: element.comment?.tags?.filter((t) => t.tag === 'see')
      .map((t) => t.text.trim()),
    access:
      element.flags.isPrivate
      || element.comment?.tags?.some((t) => t.tag === 'private' || t.tag === 'internal')
        ? 'private'
        : undefined,
    deprecated: element.comment?.tags?.some((t) => t.tag === 'deprecated'),
    type: element.type ? parseType(element.type as any) : undefined,
    meta: parseMeta(element),
  };

  let typeDef: DeclarationReflection | undefined;
  if (typeUtil.isReflectionType(element.type)) {
    typeDef = element.type.declaration;
  } else if (element.kindString === 'Interface') {
    typeDef = element;
  } else if (element.kindString === 'Enumeration') {
    return {
      ...baseReturn,
      props: element.children?.length
        ? element.children.map((child) => ({
          name: child.name,
          description: child.comment?.shortText?.trim(),
          type: typeof child.defaultValue == 'undefined' ? undefined : [[[child.defaultValue]]],
        }))
        : undefined,
    };
  } else if (element.kindString === 'Function') {
    typeDef = element
  }

  if (typeDef) {
    const { children, signatures } = typeDef;

    // It's an instance-like typedef
    if (children && children.length > 0) {
      const props: ClassMethodParamDoc[] = children.map((child) => ({
        name: child.name,
        description: child.comment?.shortText?.trim() ?? child.signatures?.[0]?.comment?.shortText?.trim(),
        optional: child.flags.isOptional ?? typeof child.defaultValue != 'undefined',
        default:
          child.comment?.tags?.find((t) => t.tag === 'default')?.text?.trim() ??
          (child.defaultValue === '...' ? undefined : child.defaultValue),
        type: child.type
          ?
          parseType(child.type as any)
          : child.kindString === 'Method'
            ? parseType({
              type: 'reflection',
              declaration: child,
            })
            : undefined,
      }));

      return {
        ...baseReturn,
        props,
      };
    }

    // For some reason, it's a function typedef
    if (signatures && signatures.length > 0) {
      const sig = signatures[0];

      const params: ClassMethodParamDoc[] | undefined = sig.parameters?.map((param) => ({
        name: param.name,
        description: param.comment?.shortText?.trim(),
        optional: param.flags.isOptional ?? typeof param.defaultValue != 'undefined',
        default:
          param.comment?.tags?.find((t) => t.tag === 'default')?.text?.trim() ??
          (param.defaultValue === '...' ? undefined : param.defaultValue),
        type: param.type ? parseType(param.type as any) : undefined,
      }));

      return {
        ...baseReturn,
        description: sig.comment?.shortText?.trim(),
        see: sig.comment?.tags?.filter((t) => t.tag === 'see').map((t) => t.text.trim()),
        access:
          sig.flags.isPrivate || sig.comment?.tags?.some((t) => t.tag === 'private' || t.tag === 'internal')
            ? 'private'
            : undefined,
        deprecated: sig.comment?.tags?.some((t) => t.tag === 'deprecated'),
        params,
        returns: sig.type ? parseType(sig.type) : undefined,
        returnsDescription: sig.comment?.returns?.trim(),
      };
    }
  }

  // It's neither an interface-like or a function type
  return baseReturn;
}