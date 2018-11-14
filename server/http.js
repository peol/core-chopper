const http = require('http');

const entries = require('./db/entries');
const games = require('./db/games');
const players = require('./db/players');

const REST_PORT = 8081;

const server = http.createServer((req, res) => {
  try {
    if (req.url === '/csv/players') {
      const allPlayers = players.getAll();
      let out = 'userid,cardid,name\n';
      out += allPlayers.map(p => `${p.userid},${p.cardid},${p.name}\n`).join('');
      res.end(out);
    } else if (req.url === '/csv/games') {
      const allGames = games.getAll();
      let out = 'userid,gameid,starttime,endtime,score, bonus\n';
      out += allGames.map(p => `${p.userid},${p.gameid},${p.starttime},${p.endtime},${p.score},${p.bonus}\n`).join('');
      res.end(out);
    } else if (req.url === '/csv/entries') {
      const allEntries = entries.getAll();
      let out = 'gameid,time,duration,speed,cadence,power\n';
      out += allEntries.map(p => `${p.gameid},${p.time},${p.duration},${p.speed},${p.cadence},${p.power}\n`).join('');
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

module.exports = {
  listen: () => server.listen(REST_PORT),
};
