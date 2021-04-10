const fs = require('fs')
const pkg = require('../package.json')

pkg.bin = { dotlit: './index.js' }
pkg.dependencies = {}

const pkgSrc = JSON.stringify(pkg,null,2)
console.log(pkg)

const indexSrc = "#!/usr/bin/env node\nrequire('./node.bundle.js')\n"
console.log(indexSrc)

fs.writeFileSync('./dist/package.json', pkgSrc, {encoding: 'utf8'})
fs.writeFileSync('./dist/index.js', indexSrc, {encoding: 'utf8'})
