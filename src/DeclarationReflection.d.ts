import * as TypeDoc from 'typedoc'

declare module 'typedoc' {
  declare namespace JSONOutput {
    export interface DeclarationReflection extends TypeDoc.JSONOutput.DeclarationReflection {
      isNonExported?: boolean
    }
  }
}