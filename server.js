var express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    bodyParser = require('body-parser'),
    port = 8080,
    game_sockets = {},
    controller_sockets = {};
    socket_shortcodes = {};
    //os = require("os");
    ip = require("ip");
    // hostname = os.hostname();

server.listen(port);

// Serve static files under the /public directory
app.use("/public", express.static(__dirname + '/public'));

// Use body-parser to get form submissions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Set up index
app.get('/', function (req, res) {
	var fs = require('fs');
	fs.readFile(__dirname + '/index.html', 'utf8', function (err,data) {
	  if (err) {
	    return console.log(err);
	  }

    var developersIp = '192.168.167.104'; // developers enter you ip here
    
    // @TODO: Below will need to be updated to handle autoscaling and SSL in AWS    
    // localhost
    if(req.hostname.indexOf('.localhost') !== -1 || req.hostname.indexOf('l.vi.com.au') !== -1){
      nodeServerIP = developersIp;
    }else{
      // development
  	  if(req.hostname.indexOf('d.vi.com.au') !== -1){
  	  	nodeServerIP = req.hostname;
  	  }else{
        // production 
        nodeServerIP = ip.address();
      }
    }
 
	  var result = data.replace(/\{ nodeServerIP \}/g, nodeServerIP);
	  res.send(result);

	});
	//res.sendFile(__dirname + '/index.html');
});

//Controller page
app.get('/controller', function (req, res) {

  res.sendFile(__dirname + '/controller.html');

});

//Get socket id from shortcode
app.post('/controller', function (req, res) {

  search_string = req.body.gameid.toLowerCase();
  console.log('searching for ' + search_string);


  if(socket_shortcodes[search_string] != undefined){
    console.log('Game found for ' + search_string);
    res.redirect('/?id=' + socket_shortcodes[shortcode]);
  }
  else{
    res.sendFile(__dirname + '/controller.html');
  }
  

});

// Log that the servers running
console.log("Server running on port: " + port);

// On any connection to the socket
io.sockets.on('connection', function (socket) {

  // When a game connects, store its socket id
	socket.on('game_connect', function(){

    console.log("Game connected");

    // Store the game socket
		game_sockets[socket.id] = {
      socket: socket,
      controller_id: undefined
    };

    shortcode = makeid();
    while(shortcode in socket_shortcodes){
      shortcode = makeid();
    }
    socket_shortcodes[shortcode] = socket.id;

    console.log("Shortcode for game: " + shortcode);

    // Notify the game of a successful connection
		socket.emit("game_connected", { shortcode: shortcode });
	});

  // When a controller attempts to connect it will send the id of the game
  // socket it is trying to connect to
	socket.on('controller_connect', function(game_socket_id){

    // If the game socket, that this controller is attempting to connect to, exists
    if(game_sockets[game_socket_id]){

      console.log("Controller connected");

      // Store the controller socket and its relevant game socket
      controller_sockets[socket.id] = {
        socket: socket,
        game_id: game_socket_id
      };

      // Notify the controller of a successful connection
      socket.emit("controller_connected", true);

      // Set the controller id on the relevant game socket object
      game_sockets[game_socket_id].controller_id = socket.id;

      // Notify relevant game socket that a controller has connected successfully
  		game_sockets[game_socket_id].socket.emit("controller_connected", true);

      // Forward the changes onto the relative game socket
    	socket.on('controller_state_change', function(data){

        if(game_sockets[game_socket_id]){

          // Notify relevant game socket of controller state change
          game_sockets[game_socket_id].socket.emit("controller_state_change", data)
        }
    	});

    }else{

      console.log("Controller failed to connect");

      // Notify the controller of a failed connection
      socket.emit("controller_connected", false);
    }
	});

  // When a socket disconnects
	socket.on('disconnect', function () {

    // If it's a game socket
    if(game_sockets[socket.id]){

      console.log("Game disconnected");

      // If this game has a controller connected to it
      if(controller_sockets[game_sockets[socket.id].controller_id]){

        // Notify relevant controller socket that the game has disconnected
        controller_sockets[game_sockets[socket.id].controller_id].socket.emit("controller_connected", false);

        // Remove game id from the relevant controller socket
        controller_sockets[game_sockets[socket.id].controller_id].game_id = undefined;
      }

      // Delete it
      delete game_sockets[socket.id];
    }

    // If it's a controller socket
    if(controller_sockets[socket.id]){

      console.log("Controller disconnected");

      // If this controller is connected to a game socket
      if(game_sockets[controller_sockets[socket.id].game_id]){

        // Notify relevant game socket that the controller has disconnected
        game_sockets[controller_sockets[socket.id].game_id].socket.emit("controller_connected", false);

        // Remove controller id from the relevant game socket
        game_sockets[controller_sockets[socket.id].game_id].controller_id = undefined;
      }

      // Delete it
      delete controller_sockets[socket.id];
    }
	});

});

function makeid()
{
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
