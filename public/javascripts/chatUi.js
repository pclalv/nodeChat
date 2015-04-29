(function () {
  function ChatUi (el) {
    var my = this;

    this.$input = $(el).find(".message-input");
    this.$display = $(el).find(".messages");
    this.chat = new Chat({ socket: io() });

    this.$input.submit(function (event) {
      event.preventDefault();
      my.handleInput();
    });
  }

  ChatUi.prototype.handleInput = function (event) {
    this.getMessage()
      .sendMessage()
      .displayMessage();
  };

  ChatUi.prototype.getMessage = function () {
    this.msg = this.$input.text();
    return this;
  };

  ChatUi.prototype.sendMessage = function () {
    this.chat.sendMessage(this.msg);
    return this;
  };

  ChatUi.prototype.displayMessage = function () {
    debugger
    var $msg = $('li').text(this.msg);

    this.$display.prepend($msg);
    this.msg = undefined;
  };

  $(function () {
    new ChatUi($("#nodechat"));
  });
})();
