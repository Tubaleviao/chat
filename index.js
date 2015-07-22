var moment = require ('moment');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.use(express.static(__dirname + '/public'));

var usernames = {};
var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;
  

  socket.on('new message', function (data) {
    var hora = moment().format('h:mm:ss a');
    socket.broadcast.emit('new message', {
	  hora: hora,
      username: socket.username,
      message: data
    });
	socket.emit('new message', {
	  hora: hora,
      username: socket.username,
      message: data
    });
  });

  socket.on('add user', function (username) {
    var client_ip_address = socket.request.connection.remoteAddress;
	var x;
	var existe = false;
	for (x in usernames){
	  if (usernames[x] == username){
		existe = true;
	  }
	}
	if(existe == false){
	    console.log(username+" "+client_ip_address);
		socket.username = username;
		usernames[username] = username;
		++numUsers;
		addedUser = true;
		socket.emit('login', {});
		socket.broadcast.emit('refresh users', {usernames: usernames});
		socket.emit('refresh users', {usernames: usernames});
	} else {
		socket.emit('login failed', {});
	}
  });
  
  socket.on('disconnect', function () {
    if (addedUser) {
	  delete usernames[socket.username]; // Arrumar isso aqui
	  --numUsers;
	  socket.broadcast.emit('refresh users', {usernames: usernames});
    }
  });
  
  socket.on('blink', function(data){
	  socket.broadcast.emit('blink', data);
  })
});
