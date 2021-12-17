#!/usr/bin/env node
import meow from 'meow'
import { typedoc } from './typedoc'
import { read } from './read'
import { generateDocs } from './docs'
import { write } from './write'

const help = `
Usage:
  $ tapok path/to/typedoc-result.json
  
Example:
  $ tapok ./docs.json -c ./typedoc-config.json -e typedoc/entry/point.ts
    ┗ will generate docs.json using typedoc and then will replace result with ddoo-compatible json file.
`

const cli = meow(help, {
  flags: {
    config: {
      alias: 'c',
      type: 'string',
      isRequired: false
    },
    entry: {
      alias: 'e',
      type: 'string',
      isRequired: false
    }
  }
})

if (!cli.input.length) cli.showHelp(1)

console.log('Starting typedoc json generation...')
typedoc(cli.flags.config, cli.flags.entry)
console.log('Finished typedoc json generation')

console.log('Reading typedoc json...')
const raw = read(cli.input[0])
const modules: any[] = []

console.log('Rewriting typedoc json...')

const rawModules = raw.children.filter(c => c.kindString === 'Module')
if (rawModules.length) {
  rawModules.forEach(c => {
    modules.push({ name: c.name, ...generateDocs(c) })
  })
} else {
  modules.push({ name: raw.name, ...generateDocs(raw) })
}

console.log('Rewritten typedoc json')

console.log('Writing rewritten json...')
write(cli.input[0], { modules })
console.log('All done')

process.exit(0)