(function () {
  window.Chat = function Chat (options) {
    this.socket = options.socket;
  };

  Chat.prototype.sendMessage = function (msg) {
    this.socket.emit("sentMesssage", msg);
  };
})();
