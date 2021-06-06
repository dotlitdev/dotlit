const express = require("@runkit/runkit/express-endpoint/1.0.0");
const cors = require("cors");
const request = require("request");

const app = express(exports);
app.use(cors());
app.use("/", (req, res) => {
  try {
    req.pipe(request("https://" + req.url.slice(1))).pipe(res);
    //  res.end(req.url);
  } catch (err) {
    res.end(err.message);
  }
});
