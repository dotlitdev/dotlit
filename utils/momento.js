export const MsToRelative = (ms, p, f) => {
    // console.log('MsToRelative', ms, p, f)
    const abs = Math.abs(ms)
    const nowish = abs <= 1000
    if (nowish) return 'now'

    const second = 1000
    const seconds = abs / second
    const future = ms > 0
    const minute = second * 60
    const minutes = abs / minute
    const hour = minute * 60
    const hours = abs / hour
    const day = hour * 24
    const days = abs / day
    const week = day * 7
    const weeks = abs / week    

    let suffix = future ? (f || 'from now') : (p || 'ago')
    let val, unit;
    // console.log({ms, abs, seconds, minutes, hours, days, weeks})
    if (abs < minute) {
        val = Math.round(seconds)
        unit = 'second'
    } else if (abs < hour) {
        val = Math.round(minutes)
        unit = 'minute' 
    } else if (abs < day) {
        val = (hours % 1 > 0.2) ? hours.toFixed(1) : Math.round(hours)
        unit = 'hour'
    } else if (abs < week) {
        val = (days % 1 > 0.2) ? days.toFixed(1) : Math.round(days)
        unit = 'day'
    } else {
        val = (weeks % 1 > 0.2) ? weeks.toFixed(1) : Math.round(weeks)
        unit = 'week'
    }

    if (val > 1) unit = `${unit}s`

    return `${val} ${unit} ${suffix}`
}

export const DatesToRelativeDelta = (a, b) => {
    // console.log('DatesToRelativeDelta', a, b)
    const A = new Date(a)
    const B = new Date(b)
    const deltaMs = A.getTime() - B.getTime()
    return MsToRelative(deltaMs, 'older', 'newer')
}