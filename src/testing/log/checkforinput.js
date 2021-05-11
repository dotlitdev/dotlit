const today = (new Date()).toISOString().split("T")[0]
const filename = `testing/log/${today}`

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

    let stat = {local:{},remote:{}} 
    try { stat = await lit.fs.readStat(filename + ".lit", {encodin: 'utf8'}) } catch(err) {}
    const newContent = (stat.local.value || stat.remote.value || `# ${today}`) + ("\n" + input)
    await lit.fs.writeFile(filename + ".lit", newContent)
    return `***Captured Input (below) to [[${filename}]]***

${input}`
    } else {
      return "*No input detected.*"
  }
}
return checkForInput()