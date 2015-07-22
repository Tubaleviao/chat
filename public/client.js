$(function() {
  var FADE_TIME = 150;
  var COLORS = [
    '#0000ff', '#ffffff', '#ff0099', '#ffff00',
    '#ff6600', '#cc00ff', '#ff0000', '#ff00ff',
    '#cccccc', '#00ccff', '#ccff66', '#87ceff'
  ];

  var $window = $(window);
  var $usernameInput = $('.usernameInput'); 
  var $messages = $('.messages'); 
  var $users = $('.users');
  var $inputMessage = $('.inputMessage'); 
  var $title = $('.title'); 

  var $loginPage = $('.login.page'); 
  var $chatPage = $('.chat.page');

  var username;
  var $currentInput = $usernameInput.focus();
  var manolos = {};
  var bluered;
  var qtdmens = 0;

  var socket = io();

  function setUsername () {
    username = cleanInput($usernameInput.val().trim());
    if (username) {
		socket.emit('add user', username);
    }
  }  

  function sendMessage () {
    var message = $inputMessage.val();
    message = cleanInput(message);
    if (message && username) {
      $inputMessage.val('');
      socket.emit('new message', message);
    }
  }

  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  function addChatMessage (data, options) {
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }
	
	if(bluered){
		qtdmens += 1;
		$title.empty();
		$title.prepend('('+qtdmens+') Tuba Chat');
	}

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);
    var $messageDiv = $('<li class="message" title="'+data.hora+'"/>')
      .data('username', data.username)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  function addMessageElement (el, options) {
    var $el = $(el);
    if (!options) {
      options = {};
    }
    $el.hide().fadeIn(FADE_TIME);
    $messages.prepend($el); //$messages.append($el);
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  function getUsernameColor (username) {
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }
  
  function addUserElement (el) {
    var $el = $(el);
    $users.prepend($el);
    $users[0].scrollTop = $users[0].scrollHeight;
  }
  
  $window.on("blur focus", function(e) {
    var prevType = $(this).data("prevType"); 
    if (prevType != e.type) {   
        switch (e.type) {
            case "blur":
                bluered = true;
                break;
            case "focus":
                bluered = false;
				$title.empty();
				$title.prepend('Tuba Chat');
				qtdmens = 0;
                break;
        }
    }
    $(this).data("prevType", e.type);
  })

  $window.keydown(function (event) {
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
	if(username){
		if (event.which === 13) 
			if($currentInput.val().trim() != "")
				sendMessage();
		socket.emit('blink', username);
	}else if (event.which === 13) 
		setUsername();
  });
  
  /*$window.unload(function(){
	   socket.emit('exit', username);
       return;
    });*/

  $loginPage.click(function () {
    $currentInput.focus();
  });

  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  socket.on('login', function (data) {
    $loginPage.fadeOut();
	$chatPage.show();
	$loginPage.off('click');
	$currentInput = $inputMessage.focus();
    var message = "Welcome";
    log(message, {prepend: true});
  });
  
  socket.on('login failed', function (data) {
    alert("User already exists");
	username = "";
  });

  socket.on('new message', function (data) {
    addChatMessage(data);
  });
  
  socket.on('refresh users', function (data) {
    var x;
	manolos = data.usernames;
	$users.empty();
    for (x in manolos){
	  var $el = $('<li>')
	  .text(manolos[x])
	  .addClass(manolos[x])
	  .css('color', getUsernameColor(manolos[x]));
	  addUserElement($el);
	}
  });
  
  socket.on('log', function (data) {
    log(data);
  });
  
  socket.on('blink', function(data){
	  $('.'+data).css("opacity","0");
	  setTimeout(function(){$('.'+data).css("opacity","1");}, 50);
  })
});
