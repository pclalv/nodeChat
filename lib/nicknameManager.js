module.exports = NicknameManager;

function NicknameManager () {
  this.guestCount = 1;
  this.nicknames = {};
};

NicknameManager.prototype.generateNick = function (socket) {
  this.nicknames[socket.id] = "guest" + this.guestCount++;
  return this.nicknames[socket.id];
};

NicknameManager.prototype.getNick = function (socket) {
  return this.nicknames[socket.id];
};

NicknameManager.prototype.handleNickChangeRequest = function (socket, newNick) {
  var response = {},
      success = this.isValidNick(newNick);

  if (success) {
    response.oldNick = this.nicknames[socket.id];
    response.newNick = newNick;
    this.nicknames[socket.id] = newNick;
  }

  response["success"] = success;
  socket.emit("nicknameChangeResponse", response);
}

NicknameManager.prototype.isValidNick = function (nick) {
  var socketId;

  if (nick.lastIndexOf("guest") === 0
    || nick === "") return false;

  for (socketId in this.nicknames) {
    if (this.nicknames[socketId] === nick) return false;
  }

  return true;
};
