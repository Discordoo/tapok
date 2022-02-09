import { execSync } from 'child_process'

export function typedoc(config?: string, entry?: string, include?: boolean) {
  let command = config ? `npx typedoc ${ entry ?? '' } --options ${ config }` : `npx typedoc ${ entry ?? '' }`

  if (include) {
    command += ' --plugin typedoc-plugin-missing-exports'
  }

  execSync(command.trim())
}