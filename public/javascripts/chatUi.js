(function () {
  function ChatUi (options) {
    var my = this
        $el = $(options.el);

    this.$form = $el.find(".message-form");
    this.$input = $el.find(".message-input");
    this.$display = $el.find(".messages");
    this.$rooms = $el.find(".rooms");
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

  ChatUi.prototype.displayNickChange = function (data) {
    this.write(data.oldNick + " has changed their nick to " + data.newNick + ".");
    this.updateUsersList(data.updatedUsers);
  };

  ChatUi.prototype.requestRoomChange = function (room) {
    this.chat.requestRoomChange(room);
    return this;
  };

  ChatUi.prototype.handleRoomChange = function (room) {
    this.write("Joined \"" + room + "\"");
    this.chat.handleRoomChange(room);
  };

  ChatUi.prototype.updateUsersList = function (usersByRoom) {
    var room, roomUsers, $roomUsers, user, $user;

    this.$rooms.empty();

    for (room in usersByRoom) {
      roomUsers = usersByRoom[room];
      if (Object.keys(roomUsers).length !== 0) {
        this.addRoomToList(room);
        $roomUsers = this.$rooms.find("#" + room + " > .users");
        for (socketId in roomUsers) {
          $user = $("<li class=\"user\">").text(roomUsers[socketId]);
          $roomUsers.append($user);
        }
      }
    }
  };

  ChatUi.prototype.addRoomToList = function (room) {
    var $room = $("<li class=\"room\" id=\"" + room + "\">")
      .append("<h2>" + room + "</h2>")
      .append("<ul class=\"users\"><ul>");
    this.$rooms.append($room);
  };

  $(function () {
    var socket = io(),
        chatUi = new ChatUi({
          socket: socket,
          el: $("#nodechat")
        });

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

    socket.on("joinRoom", function (room) {
      chatUi.handleRoomChange(room);
    });

    socket.on("updateUsers", function (updatedUsers) {
      chatUi.updateUsersList(updatedUsers);
    });
  });
})();
