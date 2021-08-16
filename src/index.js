#!/usr/bin/env node
'use strict'
import meow from 'meow'
import read from './reader.js'
import ora from 'ora'
import replace from './replacer.js'
import write from './writer.js'
import path from 'path'
import fs from 'fs'

const help = `
Usage
  $ tapok path/to/markdown/files

Examples
  $ tapok ./docs
    ┗ will add metadata to all .md files in subdirs classes/ interfaces/ enums/ modules/
`

const cli = meow(help, {
  importMeta: import.meta,
  flags: {
    'mode': {
      isRequired: false,
      type: 'string'
    }
  }
})

if (!cli.input.length) cli.showHelp(1)

const spinner = ora({
  spinner: 'dots8Bit',
  text: 'Reading...'
}).start()

if (cli.flags.mode === 'search') {
  const place = path.join(process.cwd(), cli.input[0])
  const file = fs.readFileSync(place, { encoding: 'utf-8' })
  const replaced = file
    .replace(/(\\)?&gt;/g, '>')
    .replace(/(\\)?&lt;/g, '<')
  fs.writeFileSync(place, replaced, { encoding: 'utf-8' })
  spinner.succeed('Replaced &gt/&lt in search json')
  process.exit(0)
}

const rawFiles = read(cli.input[0])
const files = replace(rawFiles, spinner)
const written = write(files, spinner)

spinner.succeed(`Added metadata to ${written === 1 ? written + ' file.' : written + ' files.'}`)
