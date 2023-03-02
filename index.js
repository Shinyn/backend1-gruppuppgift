const express = require("express");
const server = express();

server.get("/", (req, res) => {
  console.log("hello");
});

server.listen(5050);
