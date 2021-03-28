
const patchSource = (src, originalLocation, value) => {
    const pos = originalLocation.position || originalLocation
    if (!pos) throw Error("No location to patch")
    return src.slice(0, pos.start.offset) + value + src.slice(pos.end.offset);
}

export default patchSource
