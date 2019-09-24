var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var users= [];
var connections = [];

app.use(express.static(path.join(__dirname,"public")));

app.get('/', function(req, res){
  res.sendFile(__dirname + './index.html');
});

io.sockets.on('connection', function(socket){
	connections.push(socket);
	
	socket.on('disconnect', function(){
		users.splice(users.indexOf(socket.username), 1);
		
		connections.splice(connections.indexOf(socket) , 1);
		console.log('Disconnected:'+ socket.username);
		userLeft();
		updateUsernames();
	});

	//send message
	socket.on('send message',function(data){
		io.sockets.emit('new message' , {msg: data, user: socket.username});
	});

	// new user
	socket.on('new user',function(data,callback){
		callback(true);
		socket.username = data;
		users.push(socket.username);
		updateUsernames();
		joinchat();
	});

	//when user is typing 
	socket.on('typing', (data) =>{
		socket.broadcast.emit('typing',{
			username: socket.username
		})
	})



	//broadcast new user who joins the chat
	function joinchat(){
		var broadcast = socket.username +' joined the chat !' 
		io.sockets.emit('join chat', broadcast)
	}
	//broadcast when a user left
	function userLeft(){
		socket.broadcast.emit('user left', {
			username: socket.username
		}) ;
	}
	// update usernames
	function updateUsernames(){
		io.sockets.emit('get users', users);
	}
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
