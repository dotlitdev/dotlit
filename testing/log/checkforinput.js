const checkForInput = () => {
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
    return `***Captured Input:***

${input}`
    } else {
      return "*No input detected.*"
  }
}
return checkForInput()