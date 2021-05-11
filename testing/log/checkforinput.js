const date = new Date()
const isoDate = date.toISOString().split("T")[0]
const today = isoDate
const year = date.getFullYear()
const month = isoDate.split('-')[1]

const firstDayOfYear = new Date(year, 0, 1);
const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

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
    try { stat = await lit.fs.readStat(`/${filename}.lit`, {encoding: 'utf8'}) } catch(err) {}
    const newContent = ((stat.local.stat && stat.local.value) || stat.remote.value || `# ${today}

See [week ${week}](/testing/log/${year}-w${week}), [month ${month}](/testing/log/${year}-${month}) or [year ${year}](/testing/log/${year})
`) + ("\n" + input)
    await lit.fs.writeFile(`/${filename}.lit`, newContent)
    return `***Captured Input (below) to [[${filename}]]***

${input}`
    } else {
      return "*No input detected.*"
  }
}
return checkForInput()