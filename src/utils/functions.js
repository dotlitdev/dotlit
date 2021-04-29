export const NoOp = () => {}
export const Identity = x => x
export const AsInt = x => parseInt(x)
export const Undef = x => typeof x === 'undefined'

export const getMeta = (key,def) => {
    if (typeof document === "undefined") return;

    const el = document.querySelector(`meta[name="lit${key}"]`)
    const val = el ? el.getAttribute('value') : def
    return val
}

export const posstr = pos => {
    return pos ? `${pos.line}:${pos.column}-${pos.offset}` : undefined
}
