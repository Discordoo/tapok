import fs from 'fs'
import path from 'path'

export function read(file: string): Record<string, any> {
  const place = path.join(process.cwd(), file)

  const content = fs.readFileSync(place, { encoding: 'utf-8' })

  return JSON.parse(content)
}
