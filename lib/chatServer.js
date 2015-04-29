module.exports = function createChat (server) {
  var io = require("socket.io")(server),
      guestCount = 1,
      nicknames = {};

  io.on("connection", function (socket) {
    console.log(socket);

    nicknames[socket.id] = "guest" + guestCount++;

    socket.on("sentMessage", function (msg) {
      io.emit("receivedMessage", {
        msg: msg,
        nick: nicknames[socket.id]
      });
    });

    socket.on("newNick", function (nickData) {
      io.emit("changedNick", nickData);
    });

    socket.on("nicknameChangeRequest", function (newNick) {
      var response = {},
          success = isValidNick(newNick);

      if (success) {
        response.oldNick = nicknames[socket.id];
        response.newNick = newNick;
        nicknames[socket.id] = newNick;
      } 

      response["success"] = success;
      socket.emit("nicknameChangeResponse", response);
    });

    socket.on("disconnect", function () {
      io.emit("leftChat", nicknames[socket.id]);
      delete nicknames[socket.id];
    })
  });

  function isValidNick (nick) {
    var socketId;

    if (nick.lastIndexOf("guest") === 0) return false;

    for (socketId in nicknames) {
      if (nicknames[socketId] === nick) return false;
    }

    return true;
  };
};
