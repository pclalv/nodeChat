module.exports = function createChat (server) {
  var io = require("socket.io")(server),
      nickManager = require("./nicknameManager"),
      currentRooms = {}
      currentUsers = {};

  io.on("connection", function (socket) {
    console.log(socket);

    nickManager.generateNick(socket);

    joinRoom(socket, "lobby");

    socket.on("sentMessage", function (data) {
      data.nick = nickManager.getNick(socket);
      io.to(data.room).emit("receivedMessage", data);
    });

    socket.on("newNick", function (data) {
      data.updatedUsers = currentUsers;
      currentUsers[data.room][socket.id] = nickManager.getNick(socket);
      io.to(data.room).emit("changedNick", data);
    });

    socket.on("nicknameChangeRequest", function (data) {
      nickManager.handleNickChangeRequest(socket, data);
    });

    socket.on("roomChangeRequest", function (room) {
      handleRoomChangeRequest(socket, room);
    });

    socket.on("disconnect", function () {
      var room = currentRooms[socket.id];

      io.to(room).emit("leftChat", nickManager.getNick(socket));
      nickManager.deleteNick(socket);
      delete currentUsers[room][socket.id];
      delete currentRooms[socket.id];
    });
  });

  function joinRoom (socket, room) {
    socket.join(room);
    currentRooms[socket.id] = room;
    if (!currentUsers[room]) currentUsers[room] = {};
    currentUsers[room][socket.id] = nickManager.getNick(socket);
    socket.emit("changeRoom", {
      room: room,
      updatedUsers: currentUsers });
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
