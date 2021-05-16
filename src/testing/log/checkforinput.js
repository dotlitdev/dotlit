const date = new Date()
const isoDate = date.toISOString().split("T")[0]
const today = isoDate
const year = date.getFullYear()
const month = isoDate.split('-')[1]

const firstDayOfYear = new Date(year, 0, 1);
const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

const filename = t => `testing/log/${t}.lit`

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
    try { stat = await lit.fs.readStat(`/${filename(today)}`, {encoding: 'utf8'}) } catch(err) {}
    const newContent = ((stat.local.stat && stat.local.value) || stat.remote.value || `# ${today}

See [week ${week}](${filename(year + "-w" + week)}), [month ${month}](${filename(year+"-"+month)}) or [year ${year}](${filename(year)})
`) + ("\n" + input)
    await lit.fs.writeFile(`/${filename(today)}`, newContent)
    return `***Captured Input (below) to [${today}](${filename(today)})***

${input}`
    } else {
      return "*No input detected.*"
  }
}
return checkForInput()