import fs from 'fs'

export default function write(files, spinner) {

  let written = 0

  files.forEach(file => {
    spinner.text = `Writing ${file.path}...`
    spinner.render()

    fs.writeFileSync(file.path, file.content, { encoding: 'utf-8' })
    written += 1
  })

  return written

}
