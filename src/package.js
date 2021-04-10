const fs = require('fs')
const pkg = require('../package.json')

pkg.bin = './bundle.node.js'
pkg.dependencies = {}

const pkgSrc = JSON.stringify(pkg,null,2)
console.log(pkg)
fs.writeFileSync('../dist/package.json', pkgSrc, {encoding: 'utf8'})
