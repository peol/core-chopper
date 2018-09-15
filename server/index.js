const http = require('http');
const fs = require('fs');
const { NFC } = require('nfc-pcsc');

const nfc = new NFC();
const createWebSocketServer = require('./ws');
const { speedSensor, cadenceSensor, powerSensor } = require('./ant');

const REST_PORT = 8081;
const WSS_PORT = 8080;

nfc.on('reader', reader => {
  console.log("NFC reader attched");
  reader.on('card', card => {
    //TODO Add logic to query lowdb and search for existing user
    console.log(card.uid);
    sockets.forEach(s => s.send(JSON.stringify({
      type: 'nfc',
      data: {
        id: card.uid,
        name: "",
      },
    })));
  });
  reader.on('error', err => {
    console.error('error reading card ', err);
  });
});

nfc.on('error', err => {
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

// also stream data to csv files on disk on these events using "currentUser" and "isStarted":
speedSensor.on('speedData', (data) => {
  const { DeviceID, CalculatedSpeed, CumulativeSpeedRevolutionCount } = data;
  sockets.forEach(s => s.send(JSON.stringify({
    type: 'ant-speed',
    data: {
      DeviceID, CalculatedSpeed, CumulativeSpeedRevolutionCount,
    },
  })));
});

cadenceSensor.on('cadenceData', (data) => {
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
