import { execSync } from 'child_process'

export function typedoc(config?: string, entry?: string) {
  const command = config ? `npx typedoc ${ entry ?? '' } --options ${ config }` : `npx typedoc ${ entry ?? '' }`

  execSync(command.trim())
}