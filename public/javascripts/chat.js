(function () {
  window.Chat = function Chat (options) {
    this.socket = options.socket;
  };

  Chat.prototype.sendMessage = function (msg) {
    console.log("emitting msg");
    this.socket.emit("sentMessage", msg);
  };

  Chat.prototype.requestNickChange = function (newNick) {
    console.log("req nick change");
    this.socket.emit("nicknameChangeRequest", newNick);
  };

  Chat.prototype.handleNickChangeResponse = function (response) {
    this.socket.emit("newNick", response)
  };
})();
