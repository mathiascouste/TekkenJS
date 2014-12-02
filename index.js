var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sleep = require('sleep-async')();

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

var inform = function(joueur) {
	joueur.socket.emit('chat message', joueur.toJSON());
}

var joueurList = new Array();
var newJoueur = function(nom, socket) {
	var j = new Object();
	j['nom'] = nom;
	j['vie'] = 100;
	j['socket'] = socket;
	j['posX'] = 0;
	j['posY'] = 0;
	j['speedX'] = 0;
	j['speedY'] = 0;
	j['draw'] = function () {
		console.log('Nom : ' + this.nom);
		console.log('Vie : ' + this.vie);
		console.log('X : ' + this.posX + ' , Y : ' + this.posY);
		console.log('speedX : ' + this.speedX + ' , speedY : ' + this.speedY);
	};
	j['toJSON'] = function() {
		return '{	"nom":' + this.nom
					+ ',"vie":' + this.vie
					+ ',"posX":' + this.posX
					+ ',"poxY":' + this.posY
					+ '}';
	}
	j['gravity'] = function() {
		if(this.posX > 0) {
			this.speedX -= 1;
		} else {
			this.speedX = 0;
		}
	}
	j['move'] = function() {
		this.posX += this.speedX;
		this.posY += this.speedY;
		console.log("speedY : " + this.speedY);
	}
	j['action'] = function(joueur) {
		joueur.move();
		joueur.gravity();
	}
	j['start'] = function() {
		setInterval(this.action, 50, this);
	}
	return j;
}

io.on('connection', function(socket) {
	console.log('a user connected !');

	var joueur;
	var playerName;

	socket.on('new player', function(msg) {
		playerName = msg;
		joueur = newJoueur(msg, socket);
		joueur.draw();
		joueur.start();
		setInterval(inform, 100, joueur);
	});

	socket.on('chat message', function(msg){
		console.log('message: ' + msg);
		io.emit('chat message', playerName + ':' + msg);
	});
	
	socket.on('key pressed', function(key) {
		console.log('KEY = ' + key);
		if(key == 38) {
			joueur.speedX = 10;
		} else if(key == 37) { // LEFT
			joueur.speedY = -1;
		} else if(key == 39) { // RIGHT
			joueur.speedY = 1;
		}
	});
	
	socket.on('key released', function(key) {
		console.log('KEY = ' + key);
		if(key == 37) { // LEFT
			if(joueur.speedY < 0) {
				joueur.speedY = 0;
			}
		} else if(key == 39) { //RIGHT
			if(joueur.speedY > 0) {
				joueur.speedY = 0;
			}
		}
	});
	
	socket.on('disconnect', function() {
		console.log('user disconnected !');
	});
});

http.listen(3000, function() {
	console.log('listening on *: 3000');
});
