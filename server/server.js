const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const Blob = require("cross-blob");


// Startseite: Neues Multiplayerspiel -> /game.html?session=asdfasdf
// Lobby: Liste der Leute, inkl Name. Bevor eigener Name an Server gesendet wird, muss man ihn eingeben. Startbutton: 3,2,1
// Spiel

// ws://ip/session/sessionid
//  -> game already started: faaaaail
//  -> send name, receive player list possibly with id in return
//  -> if player list changes, new list of players is returned
//  -> when start button is pressed -> send start signal

const server = http.createServer();
const wss = new WebSocket.Server({ noServer: true});

server.on('upgrade', function upgrade(request, socket, head) {
	wss.handleUpgrade(request, socket, head, function done(ws) {
		wss.emit('connection', ws, request);
	});
});

function notifyOthers(sender, session, message) {
	for (const client of Object.values(session.clients)) { 
		if (client.id == sender) continue; 
		client.ws.send(message);
	}
}

const sessions = {};

wss.on('connection', function connection(ws, request) {
	const path = url.parse(request.url).pathname;
	if (!sessions[path]) {
		sessions[path] = {
			nextId: 0,
			clients: {}
		};
		console.log("Created session " + path);
	}

	const session = sessions[path];
	const clientId = session.nextId++;
	session.clients[clientId] = {id: clientId, ws:ws};

	console.log("Client " + clientId + " connected to " + path);

	ws.on('message', function incoming(message) {
		notifyOthers(clientId, session, message);
	});

	ws.on('close', function close() {
		delete session.clients[clientId];
		console.log("Client " + clientId + " disconnectd.");
		if (Object.keys(session.clients).length === 0) {
			delete sessions[path];
			console.log("Closed session " + path);
		}
	});
});

server.listen(8080);
