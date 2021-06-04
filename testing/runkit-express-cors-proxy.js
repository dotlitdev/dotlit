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
