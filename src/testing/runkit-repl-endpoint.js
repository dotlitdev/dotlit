const util = require('util')
exports.endpoint = function(req,res) {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
  });

  function requireFromString(src, filename) {
  var Module = module.constructor;
  var m = new Module();
  m._compile(src, filename);
  return m.exports;
}

  let data = '';
  req.on('data', chunk => {
    data += chunk;
  })
  req.on('end', async () => {
    const payload = JSON.parse(data)
    const exported = requireFromString(payload.src, payload.meta.filename || "untitled.js")
    let result;
    if (typeof exported === 'function') result = await exported(payload.meta)
    res.end(util.inspect({
       result, exports: exported}))
  })
  }