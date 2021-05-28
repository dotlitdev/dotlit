const express = require("@runkit/runkit/express-endpoint/1.0.0");
const request = require("request");

const app = express(exports);

app.use("*", (req, res) => {
  res.end("WIP");
});
