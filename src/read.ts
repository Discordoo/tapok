import fs from 'fs'
import path from 'path'
import * as process from 'process'

export function read(file: string): Record<string, any> {
  const place = path.join(process.cwd(), file)

  const content = fs.readFileSync(place, { encoding: 'utf-8' })

  return JSON.parse(content)
}

export function recursiveReaddir(directory: string): Array<Record<string, string>> {
  const result: Array<Record<string, string>> = []

  function loadFiles(dir = path.join(process.cwd(), directory) + '/') {
    const files = fs.readdirSync(dir)
    files.forEach((file) => {

      if (fs.lstatSync(dir + file).isDirectory()) {
        loadFiles(dir + file + '/')
        return
      }

      if (file.endsWith('.md')) {
        const content = fs.readFileSync(dir + file, { encoding: 'utf-8' })

        result.push({
          file: file.slice(0, file.length - 3),
          dir,
          content,
        })
      }

    })
  }

  loadFiles()

  return result
}