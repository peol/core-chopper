const WebSocket = require('ws');

const WSS_PORT = 8080;

const sockets = [];
const listeners = { message: [], closed: [] };

function getListeners(type) {
  if (!listeners[type]) {
    listeners[type] = [];
  }
  return listeners[type];
}

const listener = new WebSocket.Server({ port: WSS_PORT });

listener.on('connection', (socket) => {
  socket.clientId = `ws${Date.now()}`;
  console.log('websocket:opened', socket.clientId);
  sockets.push(socket);
  const respond = (type, payload) => socket.send(JSON.stringify({ type, data: payload }));

  socket.on('message', (data) => {
    console.log('websocket:received', socket.clientId, data);
    const result = JSON.parse(data);
    getListeners(result.type).forEach(l => l({ respond, data: result.data, socket }));
  });

  socket.on('close', () => {
    console.log('websocket:closed', socket.clientId);
    const idx = sockets.indexOf(socket);
    sockets.splice(idx, 1);
    getListeners('closed').forEach(l => l(socket));
  });
});

module.exports = {
  send: (type, data) => {
    sockets.forEach(s => s.send(JSON.stringify({ type, data: { data } })));
  },
  on: (evt, fn) => { getListeners(evt).push(fn); },
};
