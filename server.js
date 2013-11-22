var express = require('express');
var config = require('./config.js').config;
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var game = require('./lib/game.js');
var shouldBroadcast = true;

function setBroadcast() {
  shouldBroadcast = true;
}

function broadcast() {
  if(shouldBroadcast) {
    io.sockets.emit('gamestate', {
      frame: game.frame(),
      players: game.players(),
      boxes: game.boxes(),
    });
    
    shouldBroadcast = false;
  }
}

io.set('log level', 0);
app.set('view engine', 'ejs');
app.use('/bower_components', express.static('bower_components'));
app.use('/public', express.static('public'));
app.use('/common', express.static('common'));
app.use(express.bodyParser());

app.get('/', function(req, res) {
  res.render('index', { ai: false });
});

app.get('/ai', function(req, res) {
  res.render('index', { ai: true });
});

app.post('/up', function(req, res) {
  game.up(req.body.playerId);
  setBroadcast();
  res.end();
});

app.post('/left', function(req, res) {
  game.left(req.body.playerId);
  setBroadcast();
  res.end();
});

app.post('/right', function(req, res) {
  game.right(req.body.playerId);
  setBroadcast();
  res.end();
});

app.post('/down', function(req, res) {
  game.down(req.body.playerId);
  setBroadcast();
  res.end();
});

server.listen(process.env.PORT || config.port);

var fps = game.fps;
var framesPerSecondInMilliseconds = 1000.0 / fps;

setInterval(function() {
  var deathsOccurred = game.tick();
  if(deathsOccurred) { setBroadcast(); }
  broadcast();
}, framesPerSecondInMilliseconds);
