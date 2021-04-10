const fs = require('fs')
const pkg = require('../package.json')

pkg.bin = { dotlit: './node.bundle.js' }
pkg.dependencies = {}

const pkgSrc = JSON.stringify(pkg,null,2)
console.log(pkg)
fs.writeFileSync('../dist/package.json', pkgSrc, {encoding: 'utf8'})
