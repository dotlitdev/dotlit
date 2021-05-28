const express = require("@runkit/runkit/express-endpoint/1.0.0");
const cors = require("cors");
const request = require("request");

const app = express(exports);
app.use(cors());
app.use("*", (req, res) => {
  const target = req.header("Target-Domain");
  res.end("WIP: " + target + req.url);
  // req.pipe(request(target + req.url)).pipe(res);
});
