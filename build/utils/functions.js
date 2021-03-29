const NoOp = () => {}
const Identity = x => x
const AsInt = x => parseInt(x)

module.exports = {
    NoOp, Identity, AsInt
}