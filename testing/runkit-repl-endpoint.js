const util = require('util')

function requireFromString(src, filename) {
  var Module = module.constructor;
  var m = new Module();
  m._compile(src, filename);
  return m.exports;
}

exports.endpoint = function(req,res) {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
  });

  let data = '';
  req.on('data', chunk => {
    data += chunk;
  })
  req.on('end', async () => {
    const payload = JSON.parse(data)
    const exported = requireFromString(payload.src, payload.meta.filename || "untitled.js")
    let result;
    if (typeof exported === 'function') {
      try {
        result = await exported(payload.meta)
        res.end(util.inspect({
          result
        }))
      } catch(error) {
        res.end(util.inspect({error}))
      }
    } else {
      res.end(util.inspect({
        exports: exported
      }))
    }
  })
  }