module.exports = function createChat (server) {
  var io = require("socket.io")(server),
      guestCount = 1,
      nicknames = {},
      currentRooms = {}
      currentUsers = {};

  io.on("connection", function (socket) {
    console.log(socket);

    nicknames[socket.id] = "guest" + guestCount++;

    joinRoom(socket, "lobby");

    socket.on("sentMessage", function (data) {
      data.nick = nicknames[socket.id];

      io.to(data.room).emit("receivedMessage", data);
    });

    socket.on("newNick", function (data) {
      data.updatedUsers = currentUsers;
      currentUsers[data.room][socket.id] = nicknames[socket.id];
      io.to(data.room).emit("changedNick", data);
    });

    socket.on("nicknameChangeRequest", function (data) {
      var response = {},
          success = isValidNick(data.newNick);

      if (success) {
        response.oldNick = nicknames[socket.id];
        response.newNick = data.newNick;
        nicknames[socket.id] = data.newNick;
      }

      response["success"] = success;
      socket.emit("nicknameChangeResponse", response);
    });

    socket.on("roomChangeRequest", function (room) {
      handleRoomChangeRequest(socket, room);
    });

    socket.on("disconnect", function () {
      var room = currentRooms[socket.id];

      io.to(room).emit("leftChat", nicknames[socket.id]);
      delete nicknames[socket.id];
      delete currentUsers[room][socket.id];
      delete currentRooms[socket.id];
    });
  });

  function isValidNick (nick) {
      var socketId;

      if (nick.lastIndexOf("guest") === 0
        || nick === "") return false;

      for (socketId in nicknames) {
        if (nicknames[socketId] === nick) return false;
      }

      return true;
    };

  function joinRoom (socket, room) {
    socket.join(room);
    currentRooms[socket.id] = room;
    if (!currentUsers[room]) currentUsers[room] = {};
    currentUsers[room][socket.id] = nicknames[socket.id];
    socket.emit("changeRoom", room);
  };

  function leaveRoom (socket, room) {
    socket.leave(room);
    delete currentUsers[room][socket.id];
  };

  function handleRoomChangeRequest (socket, room) {
    var oldRoom = currentRooms[socket.id];

    leaveRoom(socket, oldRoom);
    joinRoom(socket, room);
    io.to(oldRoom).emit("leftChat", nicknames[socket.id]);
  };
};
