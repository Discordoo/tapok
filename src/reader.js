import fs from 'fs'
import path from 'path'

export default function read(dir) {
  const place = path.join(process.cwd(), dir, '/')

  let classes, interfaces, enums, modules

  try {
    classes =    fs.readdirSync(place + 'classes')    .map(f => place + `classes/${f}`)
    interfaces = fs.readdirSync(place + 'interfaces') .map(f => place + `interfaces/${f}`)
    enums =      fs.readdirSync(place + 'enums')      .map(f => place + `enums/${f}`)
    modules =    fs.readdirSync(place + 'modules')    .map(f => place + `modules/${f}`)
  } catch (e) {
    console.error('Error when reading directories:', e)
    process.exit(1)
  }

  return [
    ...classes    .map(c => ({ content: fs.readFileSync(c, { encoding: 'utf-8' }), path: c, type: 'class' })),
    ...interfaces .map(i => ({ content: fs.readFileSync(i, { encoding: 'utf-8' }), path: i, type: 'interface' })),
    ...enums      .map(e => ({ content: fs.readFileSync(e, { encoding: 'utf-8' }), path: e, type: 'enum' })),
    ...modules    .map(m => ({ content: fs.readFileSync(m, { encoding: 'utf-8' }), path: m, type: 'module' }))
  ]
}
