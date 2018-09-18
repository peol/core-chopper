const http = require('http');
const fs = require('fs');
const { NFC } = require('nfc-pcsc');
const lowdb = require('./lowdb').Lowdb;


const nfc = new NFC();
const createWebSocketServer = require('./ws');
const { speedSensor, cadenceSensor, powerSensor } = require('./ant');
const playerdb = new lowdb('players', { players: [] });
// const playerdb = require('./lowdb').getInstance('players', { players: [] });
// const gamedb = require('./lowdb').getInstance('games', { games: [] });
// const entrydb = require('./lowdb').getInstance('entries', { entries: [] });


const REST_PORT = 8081;
const WSS_PORT = 8080;


nfc.on('reader', (reader) => {
  console.log('NFC reader attched');
  reader.on('card', (card) => {
    var player = {userid: card.uid, name: ''};
    var result = playerdb.get('players').find({ userid: card.uid }).value();
    if(!result){
      playerdb.get('players').push(player).write();
    }
    else{
      player.name = result.name;
    }

    console.log(card.uid);
    sockets.forEach(s => s.send(JSON.stringify({
      type: 'nfc',
      data: player,
    })));
  });
  reader.on('error', (err) => {
    console.error('error reading card ', err);
  });
});

nfc.on('error', (err) => {
  console.error('NFC card reader error ', err);
});

const { socket, sockets } = createWebSocketServer(WSS_PORT);

let isStarted = false;
let currentUser = { id: null, name: null };

socket.on('message', (data) => {
  const result = JSON.parse(data);
  console.log('socket data', data.result);
  if (result.type === 'set-user') {
    currentUser = result.data;
  } else if (result.type === 'started') {
    isStarted = true;
  } else if (result.type === 'highscore') {
    isStarted = false;
    // update games.csv with highscore
    // result.data;
  }
});

let latestSpeed = 0;
let latestCadence = 0;
let latestPower = 0;
let latestWrite = 0;
const writeStream = fs.createWriteStream(`${__dirname}/mock/entries.csv`, { flags: 'a' });

// also stream data to csv files on disk on these events using "currentUser" and "isStarted":
speedSensor.on('speedData', (data) => {
  if (latestWrite === data.SpeedEventTime) {
    return;
  }
  latestWrite = data.SpeedEventTime;
  latestSpeed = data.CalculatedSpeed;
  writeStream.write(`1,${+new Date()},${latestSpeed},${latestCadence},${latestPower}\n`);
  // console.log('wrote data', data.CalculatedSpeed);
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
      res.end(fs.readFileSync(`${__dirname}/mock/players.csv`));
    } else if (req.url === '/csv/games') {
      res.end(fs.readFileSync(`${__dirname}/mock/games.csv`));
    } else if (req.url === '/csv/entries') {
      res.end(fs.readFileSync(`${__dirname}/mock/entries.csv`));
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
