(function () {
  function ChatUi (options) {
    var my = this
        $el = $(options.el);

    this.$form = $el.find(".message-form");
    this.$input = $el.find(".message-input")
    this.$display = $el.find(".messages");
    this.chat = new Chat({ socket: options.socket });

    this.$form.submit(function (event) {
      event.preventDefault();
      my.handleInput();
    });
  }

  ChatUi.prototype.handleInput = function (event) {
    this.getMessage()
      .sendMessage()
      .clearInput();
  };

  ChatUi.prototype.receiveMessage = function (msg) {
    this.msg = msg;
    this.displayMessage();
  }

  ChatUi.prototype.getMessage = function () {
    this.msg = this.$input.val();
    return this;
  };

  ChatUi.prototype.sendMessage = function () {
    this.chat.sendMessage(this.msg);
    return this;
  };

  ChatUi.prototype.displayMessage = function () {
    var $msg = $('<li>').text(this.msg);

    this.$display.prepend($msg);
    this.msg = undefined;
    return this;
  };

  ChatUi.prototype.clearInput = function () {
    this.$input.val("");
  };

  $(function () {
    var socket = io(),
        chatUi = new ChatUi({
          el: $("#nodechat"),
          socket: socket
        });

    socket.on("receivedMessage", function (msg) {
      chatUi.receiveMessage(msg);
    });
  });
})();
