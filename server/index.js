const http = require('http');
const fs = require('fs');
const { NFC } = require('nfc-pcsc');
const {
  getOrCreateUser, updateUser, getAllPlayers, createGame, updateGame, createEntries, getAllGames, getAllEntries, removeGame, removeEntries
} = require('./lowdb');

const nfc = new NFC();
const createWebSocketServer = require('./ws');
const { speedSensor, cadenceSensor, powerSensor } = require('./ant');

const REST_PORT = 8081;
const WSS_PORT = 8080;

nfc.on('reader', (reader) => {
  console.log('NFC reader attached');
  reader.on('card', (card) => {
    const user = getOrCreateUser(card.uid);
    currentUser = user;
    console.log(card.uid);
    sockets.forEach(s => s.send(JSON.stringify({
      type: 'nfc',
      data: user,
    })));
  });
  reader.on('error', (err) => {
    console.error('error reading card ', err);
  });
});

nfc.on('error', (err) => {
  console.error('NFC card reader error ', err);
});

let currentGame = null;
let currentUser = { id: null, name: null };
let latestSpeed = 0;
let latestCadence = 0;
let latestPower = 0;
let latestWrite = 0;


const { socket, sockets } = createWebSocketServer(WSS_PORT, (data) => {
  const result = JSON.parse(data);
  console.log('socket data', result);
  if (result.type === 'set-user') {
    updateUser(result.data);
    currentUser = result.data;
  } else if (result.type === 'started') {
    currentGame = createGame(currentUser);
  } else if (result.type === 'ended') {
    // update games.csv with highscore
    // result.data;
    updateGame(currentGame, result.data);
    currentGame = null;
  }
}, () => {
  if (currentGame) {
    removeGame(currentGame);
    removeEntries(currentGame);
  }
  currentUser = null;
  currentGame = null;
});

speedSensor.on('speedData', (data) => {
  if (latestWrite === data.SpeedEventTime) {
    return;
  }
  latestWrite = data.SpeedEventTime;
  latestSpeed = data.CalculatedSpeed;
  if (currentGame) {
    createEntries(currentGame, latestSpeed, latestCadence, latestPower);
  }
  const { DeviceID, CalculatedSpeed, CumulativeSpeedRevolutionCount } = data;
  sockets.forEach(s => s.send(JSON.stringify({
    type: 'ant-speed',
    data: {
      DeviceID, CalculatedSpeed, CumulativeSpeedRevolutionCount,
    },
  })));
});

cadenceSensor.on('cadenceData', (data) => {
  latestCadence = data.CalculatedCadence;
  const { DeviceID, CalculatedCadence, CumulativeCadenceRevolutionCount } = data;
  sockets.forEach(s => s.send(JSON.stringify({
    type: 'ant-cadence',
    data: {
      DeviceID, CalculatedCadence, CumulativeCadenceRevolutionCount,
    },
  })));
});

if (powerSensor) {
  powerSensor.on('powerData', (data) => {
    latestPower = data.Power;
    const { DeviceID, Power } = data;
    sockets.forEach(s => s.send(JSON.stringify({
      type: 'ant-power',
      data: {
        DeviceID, Power,
      },
    })));
  });
}

const server = http.createServer((req, res) => {
  try {
    if (req.url === '/csv/players') {
      const players = getAllPlayers();
      let out = 'userid,name\n';
      out += players.map(p => `${p.userid},${p.name}\n`).join('');
      res.end(out);
    } else if (req.url === '/csv/games') {
      const games = getAllGames();
      let out = 'userid,gameid,starttime,endtime,score\n';
      out += games.map(p => `${p.userid},${p.gameid},${p.starttime},${p.endtime},${p.score}\n`).join('');
      res.end(out);
    } else if (req.url === '/csv/entries') {
      const entires = getAllEntries();
      let out = 'gameid,time,duration,speed,cadence,power\n';
      out += entires.map(p => `${p.gameid},${p.time},${p.duration},${p.speed},${p.cadence},${p.power}\n`).join('');
      res.end(out);
    } else {
      res.status = 404;
      res.end('Not found');
    }
  } catch (err) {
    res.status = 500;
    res.end(err.stack);
  }
});

server.listen(REST_PORT);

console.log(`REST listening on: ${REST_PORT}\nWebSocket Server listening on: ${WSS_PORT}`);
