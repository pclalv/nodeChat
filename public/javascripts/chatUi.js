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
        matchData = this.$input.val().match(/^\/([A-z]+)\s*(\w*)/);

    if (matchData) {
      this.processCommand(matchData);
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

  ChatUi.prototype.processCommand = function (input) {
    var command = input[1],
        arg = input[2];

    switch (command) {
      case "nick":
        this.requestNickChange(arg)
          .clearInput();
        break;
      case "join":
        this.requestRoomChange(arg)
          .clearInput();
        break;
      default:
        this.displayCommandError(command)
          .clearInput();
        break;
    }
  };

  ChatUi.prototype.displayCommandError = function (command) {
    this.write("\"" + command + "\" is not a valid command.");
    return this;
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
    debugger
    this.write(nickData.oldNick + " has changed their nick to " + nickData.newNick + ".");
  };

  ChatUi.prototype.requestRoomChange = function (room) {
    this.chat.requestRoomChange(room);
    return this;
  };

  ChatUi.prototype.handleRoomChange = function (room) {
    this.chat.handleRoomChange(room);
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
    });

    socket.on("changeRoom", function (room) {
      chatUi.handleRoomChange(room);
    })
  });
})();
