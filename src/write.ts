import path from 'path'
import fs from 'fs'

export function write(file: string, json: Record<string, any>) {
  const place = path.join(process.cwd(), file)

  fs.writeFileSync(place, JSON.stringify(json), { encoding: 'utf-8' })
}