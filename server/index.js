const players = require('./db/players');
const games = require('./db/games');
const entries = require('./db/entries');
const ws = require('./ws');
const http = require('./http');
const ant = require('./sensors/ant');

const activeGames = [];

if (process.argv.indexOf('--disable-nfc') > -1) {
  console.log('reader:skipped');
} else {
  const nfc = require('./sensors/nfc'); // eslint-disable-line global-require

  nfc.on('scan', async ({ uid }) => {
    let user = players.get({ cardid: uid });
    if (!user) {
      user = players.create({ cardid: uid });
    }
    ws.send('player:scanned', user);
  });
}

ant.on('tick', ({ speed, cadence, power }) => {
  console.log('ant:tick', power);
  activeGames.forEach(({ game: { gameid, starttime } }) => {
    entries.create({
      gameid,
      speed,
      cadence,
      power,
      duration: Date.now() - starttime,
    });
  });
  ws.send('game:tick', { speed, cadence, power });
});

ws.on('player:save', ({ data, respond }) => {
  let player = players.get({ userid: data.userid });
  if (!player) player = players.create(data);
  else player = players.update(data);
  respond('player:saved', player);
});

ws.on('player:list', ({ respond }) => {
  respond('player:listed', players.getAll());
});

ws.on('game:simulate', ({ data }) => {
  ant.simulate({
    ...data,
    onTick: pwr => ant.emit('tick', { speed: 0, cadence: 50, power: pwr }),
  });
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
