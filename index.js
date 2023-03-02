const express = require("express");
const server = express();
const { country } = require("./server");

server.get("/", (req, res) => {
  console.log("hello", country);
  res.status(200).send(country);
});

server.listen(5050);
