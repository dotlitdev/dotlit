const express = require("@runkit/runkit/express-endpoint/1.0.0");
const cors = require("cors");
const request = require("request");

const app = express(exports);
app.use(cors());
app.use("/", (req, res) => {
  try {
    const target = req.header("Target-Domain");
    req.pipe(request(target + req.url)).pipe(res);
  } catch (err) {
    res.end(err.message);
  }
});

```
```>txt attached=true updated=1622842925256 !error
function toString() {
    [native code]
}
runkit-express-cors-proxy.js:2:40
runkit-express-cors-proxy.js:18:63
module code@runkit-express-cors-proxy.js:18:139
evaluate@[native code]
moduleEvaluation@[native code]