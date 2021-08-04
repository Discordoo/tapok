function withACapital(sting) {
  return sting.slice(0, 1).toUpperCase() + sting.slice(1)
}

export default function replace(files, spinner) {

  files.forEach(file => {
    spinner.text = `Rendering ${file.path}...`
    spinner.render()

    const fileContent = file.content.split('\n')

    const firstLine = fileContent[0].split('/ ')
    const name = firstLine[firstLine.length - 1]
    const metadata = `---\ntitle: ${file.type === 'module' ? withACapital(name) : name}\n---\n\n`

    const secondLine = fileContent[4]
    file.content = file.content.replace(secondLine, '').replace(/\\>/g, '>')
    file.content = metadata + file.content
  })

  return files

}
