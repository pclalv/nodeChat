module.exports = function createChat (server) {
  var io = require("socket.io")(server);

  io.on("connection", function (socket) {
    console.log(socket);

    socket.on("sentMessage", function (msg) {
      io.emit("receivedMessage", msg);
    });
  });
};