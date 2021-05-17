export const NoOp = () => {}
export const Identity = x => x
export const AsInt = x => parseInt(x)
export const Undef = x => typeof x === 'undefined'

export const getMeta = (key,def) => {
    if (typeof document === "undefined" || !document.querySelector) return def;

    const el = document.querySelector(`meta[name="lit${key}"]`)
    const val = el ? el.getAttribute('value') : def
    return val
}

export const posstr = pos => {
    return pos ? `${pos.line}:${pos.column}-${pos.offset}` : undefined
}

export const wait = async (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export const template = (templateString, templateVars) => {
    console.log(templateString)
    const escaped = templateString.replace(/`/g, '\\`')
    console.log(escaped)
    const body = "return `"+ escaped +"`;"
    console.log(body)
    return new Function(body).call(templateVars)
}