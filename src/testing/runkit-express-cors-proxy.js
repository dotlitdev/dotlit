const express = require("@runkit/runkit/express-endpoint/1.0.0");
const cors = require("cors");
const request = require("request").defaults({ maxRedirects: 100 });

const app = express(exports);
app.use(cors());
app.use("/:path", (req, res) => {
  try {
    const target = req.header("Target-Domain");
    res.end(
      JSON.stringify({ target, url: req.url, params: req.params }, null, 2)
    );
    // req.pipe(request(target + req.url)).pipe(res);
  } catch (err) {
    res.end(err.message);
  }
});
