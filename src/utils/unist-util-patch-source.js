
const patchSource = (src, originalLocation, value) => {
    const pos = originalLocation.position || originalLocation
    return src.slice(0, pos.start.offset) + value + src.slice(pos.end.offset);
}

export default patchSource
