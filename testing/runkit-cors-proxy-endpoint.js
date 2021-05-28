const util = require("util");

exports.endpoint = function (req, res) {
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
  });

  res.end("WIP");
};
