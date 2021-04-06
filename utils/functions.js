export const NoOp = () => {}
export const Identity = x => x
export const AsInt = x => parseInt(x)
export const getMeta = (key,def) => {
    const el = document.querySelector(`meta[name="lit${key}"]`)
    const val = el ? el.getAttribute('value') : def
    return val
}