import { execSync } from 'child_process'

export function typedoc(config?: string) {
  const command = config ? `npx typedoc --options ${ config }` : `npx typedoc`

  execSync(command)
}