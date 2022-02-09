#!/usr/bin/env node
import meow from 'meow'
import { typedoc } from './typedoc'
import { read, recursiveReaddir } from './read'
import { generateDocs } from './docs'
import { write } from './write'
import { version, name } from '../package.json'
import fs from 'fs'
import path from 'path'
import * as process from 'process'

const help = `
${name} ${version}

Usage:
  $ tapok path/to/typedoc-result.json
  $ tapok path/to/markdown-contents-file.json
  
Flags:
  --config -c     string    typedoc config (like typedoc.json)
  --entry -e      string    typedoc entry point (used in typedoc --entry)
  --markdown -m   boolean   switch to markdown files processing
  --directory -d  string    directory where read markdown files
  
Examples:
  $ tapok ./docs.json -c ./typedoc-config.json -e typedoc/entry/point.ts
    ┗ will generate docs.json using typedoc and then will replace result with ddoo-compatible json file.
  $ tapok ./markdown.json -m -d ./docs
    ┗ will generate markdown.json that contains array of markdown files from docs directory
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
    },
    markdown: {
      alias: 'md',
      type: 'boolean',
      isRequired: flags => !!flags.directory
    },
    directory: {
      alias: 'd',
      type: 'string',
      isRequired: flags => !!flags.markdown
    },
    include: {
      alias: 'i',
      type: 'boolean',
      isRequired: false
    }
  }
})

if (!cli.input.length) cli.showHelp(1)

console.log(`You're using ${name} v${version}`)

if (cli.flags.m || cli.flags.markdown) {
  console.log('Gathering all .md files from specified directory...')
  const files = recursiveReaddir((cli.flags.directory || cli.flags.d) as string)

  if (files.length) {
    console.log(`${files.length} file${files.length === 1 ? '' : 's'} found`)

    console.log('Writing json file...')
    fs.writeFileSync(path.join(process.cwd(), cli.input[0]), JSON.stringify({
      files, time: Date.now(), generator: `${name} ${version}`
    }), { encoding: 'utf-8' })
    console.log('Done')

  } else console.log('There is no .md files in the specified directory')

  process.exit(0)
}

console.log('Starting typedoc json generation...')
typedoc(cli.flags.config, cli.flags.entry, cli.flags.include)
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
write(cli.input[0], { modules, time: Date.now(), generator: `${name} ${version}` })
console.log('All done')

process.exit(0)