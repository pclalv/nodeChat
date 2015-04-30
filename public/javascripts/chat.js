(function () {
  window.Chat = function Chat (options) {
    this.socket = options.socket;
  };

  Chat.prototype.sendMessage = function (msg) {
    this.socket.emit("sentMessage", {
      msg: msg,
      room: this._room });
  };

  Chat.prototype.requestNickChange = function (newNick) {
    this.socket.emit("nicknameChangeRequest", {
      newNick: newNick,
      room: this._room });
  };

  Chat.prototype.handleNickChangeResponse = function (response) {
    response.room = this._room;
    this.socket.emit("newNick", response)
  };

  Chat.prototype.requestRoomChange = function (room) {
    this.socket.emit("roomChangeRequest", roo);
  };

  Chat.prototype.handleRoomChange = function (room) {
    this._room = room;
  }
})();
