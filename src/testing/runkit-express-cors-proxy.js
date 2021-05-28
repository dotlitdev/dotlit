const express = require("@runkit/runkit/express-endpoint/1.0.0");
const cors = require("cors");
const request = require("request");

const app = express(exports);
app.use(cors());
app.use("*", (req, res) => {
  res.end("WIP: " + req.header("Target-Domain"));
  // req.pipe(request("http://foo.com/api" + req.url)).pipe(res);
});
