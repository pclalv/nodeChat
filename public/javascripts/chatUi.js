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
  };

  ChatUi.prototype.write = function (text) {
    var $msg = $('<li>').text(text);

    this.$display.append($msg);
  };

  ChatUi.prototype.handleInput = function () {
    var command, args,
        matchData = this.$input.val().match(/^\/([A-z]+)\s(\w+)/);

    if (matchData) {
      command = matchData[1];
      args = matchData[2];

      switch (command) {
        case "nick":
          this.requestNickChange(args)
            .clearInput();
          break;
        default:
          this.displayCommandError(command)
            .clearInput();
          break;
      }
    } else {
      this.getMessage()
        .sendMessage()
        .clearInput();
    }
  };

  ChatUi.prototype.getMessage = function () {
    this.msg = this.$input.val();
    return this;
  };

  ChatUi.prototype.sendMessage = function () {
    this.chat.sendMessage(this.msg);
    return this;
  };

  ChatUi.prototype.displayMessage = function (messageData) {
    this.write(messageData.nick + ": " + messageData.msg);
    this.msg = undefined;
  };

  ChatUi.prototype.clearInput = function () {
    this.$input.val("");
  };

  ChatUi.prototype.displayDeparture = function (nick) {
    this.write(nick + " has left.")
  };

  ChatUi.prototype.requestNickChange = function (newNick) {
    this.chat.requestNickChange(newNick);
    return this;
  };

  ChatUi.prototype.handleNickChangeResponse = function (response) {
    if (response.success) {
      this.chat.handleNickChangeResponse(response);
    } else {
      this.write("Invalid nickname.");
    }
  };

  ChatUi.prototype.displayNickChange = function (nickData) {
    this.write(nickData.oldNick + " has changes their nick to " + nickData.newNick + ".");
  };

  ChatUi.prototype.displayCommandError = function (command) {
    this.write("\"" + command + "\" is not a valid command.");
    return this;
  };

  $(function () {
    var socket = io(),
        chatUi = new ChatUi({
          socket: socket,
          el: $("#nodechat")
        });

    // i'd like to implement these differently; seems invasive as is
    socket.on("receivedMessage", function (messageData) {
      chatUi.displayMessage(messageData);
    });

    socket.on("leftChat", function (nick) {
      chatUi.displayDeparture(nick);
    })

    socket.on("nicknameChangeResponse", function (response) {
      chatUi.handleNickChangeResponse(response);
    });

    socket.on("changedNick", function (nickData) {
      chatUi.displayNickChange(nickData);
    })
  });
})();
