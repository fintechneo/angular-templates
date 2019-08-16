
// Proxy config for Angular CLI for routing to websocket relay
const PROXY_CONFIG = [
    {
        context: ["/websocketrelay"],
        "target": "ws://localhost:15000",
        "ws": true,
        "changeOrigin": true
    }
]

// Start a simple web socket chat relay server
const WebSocket = require('ws');
const server = new WebSocket.Server({port: 15000});
server.on('connection', connection => {
    connection.on('message', (message) => {
        console.log('Received message', message);
        server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });  
    });
    
});

module.exports = PROXY_CONFIG;