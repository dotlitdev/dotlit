const today = (new Date()).toISOString().split("T")[0]
const filename = `log/${today}.lit`

const checkForInput = async () => {
  const insp = lit.utils.inspect
  const qs = lit.utils.querystring

  const search = location.search
  const query = search
              && qs.parse(search.slice(1))

  if (query?.input) {
    const input = query.input
    delete query.input
    const qsWoInput = qs.stringify(query)
    window.history.replaceState(null,null,'?' + qsWoInput)

    const stat = await lit.fs.readStat(filename, {encodin: 'utf8'})
    const newContent = (stat.local.value || stat.remote.value || `# ${today}`) + ("\n" + input)
    await lit.fs.writeFile(filename, newContent)
    return `***Captured Input (below) to ${filename}***

${input}`
    } else {
      return "*No input detected.*"
  }
}
return checkForInput()