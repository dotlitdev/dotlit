const express = require("@runkit/runkit/express-endpoint/1.0.0");
const cors = require("cors");

const app = express(exports);
app.use(cors());
app.use("*", (req, res) => {
  res.end("WIP");
});
