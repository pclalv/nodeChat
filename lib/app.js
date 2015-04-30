var file, server,
    port = process.env.PORT || 8000,
    http = require("http"),
    nodeStatic = require("node-static"),
    createChat = require("./chatServer");

file = new nodeStatic.Server('./public');

server = http.createServer(function (req, res) {
  req.addListener('end', function () {
    file.serve(req, res);
  }).resume();
});

createChat(server);

server.listen(port);

console.log("server is running on port " + port);
