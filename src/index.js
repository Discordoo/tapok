#!/usr/bin/env node
'use strict'
import meow from 'meow'
import read from './reader.js'
import ora from 'ora'
import replace from './replacer.js'
import write from './writer.js'

const help = `
Usage
  $ tapok path/to/markdown/files

Examples
  $ tapok ./docs
    ┗ will add metadata to all .md files in subdirs classes/ interfaces/ enums/ modules/
`

const cli = meow(help, {
  importMeta: import.meta
})

if (!cli.input.length) cli.showHelp(1)

const spinner = ora({
  spinner: 'dots8Bit',
  text: 'Reading...'
}).start()

const rawFiles = read(cli.input[0])
const files = replace(rawFiles, spinner)
const written = write(files, spinner)

spinner.succeed(`Added metadata to ${written === 1 ? written + ' file.' : written + ' files.'}`)
