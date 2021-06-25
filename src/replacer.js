function withACapital(sting) {
  return sting.slice(0, 1).toUpperCase() + sting.slice(1)
}

export default function replace(files, spinner) {

  files.forEach(file => {
    spinner.text = `Rendering ${file.path}...`
    spinner.render()

    const firstLine = file.content.split('\n')[0].split('/ ')
    const name = firstLine[firstLine.length - 1]
    const metadata = `---\ntitle: ${file.type === 'module' ? withACapital(name) : name}\n---\n\n`
    file.content = metadata + file.content
  })

  return files

}
