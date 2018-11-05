const players = require('./db/players');
const games = require('./db/games');
const entries = require('./db/entries');
const ws = require('./ws');
const http = require('./http');
const nfc = require('./sensors/nfc');
const ant = require('./sensors/ant');

const activeGames = [];

nfc.on('scan', async ({ id }) => {
  ws.send('player:scanned', { id });
});

ant.on('tick', ({ speed, cadence, power }) => {
  activeGames.forEach(({ gameid, starttime }) => {
    entries.create({
      gameid,
      speed,
      cadence,
      power,
      duration: +Date.now() - starttime,
    });
  });
  ws.send('game:tick', { speed, cadence, power });
});

ws.on('player:save', ({ data, respond }) => {
  let player = players.get(data.userid);
  if (!player) {
    player = players.create(data);
  } else {
    player = players.update(data);
  }
  respond('player:saved', player);
});

ws.on('game:create', ({ data, respond, socket }) => {
  const game = games.create({ userid: data.userid });
  activeGames.push({ game, socket });
  respond('game:created', game);
});

ws.on('game:end', ({ data, respond }) => {
  const game = games.end(data);
  const idx = activeGames.findIndex(e => e.game.gameid === game.gameid);
  activeGames.splice(idx, 1);
  respond('game:ended', game);
});

ws.on('closed', (socket) => {
  const idx = activeGames.findIndex(e => e.socket.clientId === socket.clientId);
  if (idx > -1) {
    console.log('game:clean', 'cleaning active game since socket disconnected');
    const entry = activeGames[idx];
    entries.removeAllFromGame(entry.game.gameid);
    games.remove(entry.game.gameid);
    activeGames.splice(idx, 1);
  }
});

http.listen();
