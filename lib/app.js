"use strict"

var file, server,
    http = require("http"),
    nodeStatic = require("node-static");
    createChat = require("./chatServer");

file = new nodeStatic.Server('./public');

server = http.createServer(function (req, res) {
  req.addListener('end', function () {
    file.serve(req, res);
  }).resume();
});

server.listen(8000);
