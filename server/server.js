const WebSocket = require('ws');
const Blob = require("cross-blob");

const enc = new TextEncoder();
const wss = new WebSocket.Server({ port: 8080 });

let clients = [];

function notifyOthers(sender, message) {
	for (let i = 0; i < clients.length; i++) {
		if (i == sender) continue;
		clients[i].send(message);
	}
}

wss.on('connection', function connection(ws) {
	const clientId = clients.length;
	clients.push(ws);

	ws.on('message', function incoming(message) {
		notifyOthers(clientId, message);
	});
/*
	let z = 0;
	setInterval(function() {
		// we observed that reasonable movement is roughly 5 steps per 16ms	
		const deltaZ = 500 / 16 * 5;
		z += -deltaZ;
		//const msg = enc.encode(JSON.stringify({x:0, y:0, z}));
		const msg = JSON.stringify({x:0, y:0, z});
		ws.send(msg);
	}, 500);
*/
});
