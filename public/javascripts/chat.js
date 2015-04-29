(function () {
  window.Chat = function Chat (options) {
    this.socket = options.socket;
  };

  Chat.prototype.sendMessage = function (msg) {
    console.log("emitting msg");
    this.socket.emit("sentMessage", msg);
  };

  Chat.prototype.displayMessage = function (msg) {

  }
})();
