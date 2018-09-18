const WebSocket = require('ws');

module.exports = function create(port, onMessage, onClose) {
  const socket = new WebSocket.Server({ port });
  const sockets = [];

  socket.on('connection', (ws) => {
    sockets.push(ws);
    ws.on('message', onMessage);
    /* ws.on('send', (message) => {
      console.log('sent: %s', message);
    });

    ws.on('message', (message) => {
      console.log('received: %s', message);
    }); */

    ws.on('close', () => {
      const idx = sockets.indexOf(ws);
      sockets.splice(idx, 1);
    });
  });

  return { socket, sockets };
};
