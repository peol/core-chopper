const lowdb = require('lowdb');
const fs = require('fs');
const path = require('path');
const FileSync = require('lowdb/adapters/FileSync');
const shortid = require('shortid');

function Lowdb(name, defaults) {
  const databaseFolder = path.join(__dirname, '../', 'database/');
  if (!fs.existsSync(databaseFolder)) {
    fs.mkdirSync(databaseFolder);
  }
  const adapter = new FileSync(path.join(databaseFolder, `${name}.json`));
  const db = lowdb(adapter);
  db.defaults(defaults).write();
  return db;
}

const playerdb = new Lowdb('players', { players: [] });
const gamedb = new Lowdb('games', { games: [] });
const entrydb = new Lowdb('entries', { entries: [] });

function getOrCreateUser(cardid) {
  const player = {
    userid: shortid.generate(),
    cardid: cardid || shortid.generate(),
    name: 'Test user',
  };
  let result = playerdb.get('players').find({ cardid }).value();
  if (!result) {
    result = playerdb.get('players').push(player).write();
  }
  return result;
}

function createEntries(currentGame, latestSpeed, latestCadence, latestPower) {
  const entry = {
    gameid: currentGame.gameid,
    time: +Date.now(),
    duration: +Date.now() - currentGame.starttime,
    speed: latestSpeed,
    cadence: latestCadence,
    power: latestPower,
  };
  entrydb.get('entries').push(entry).write();
}

function createGame(user) {
  const game = {
    userid: user.userid,
    gameid: shortid.generate(),
    starttime: Date.now(),
    endtime: '',
    score: 0,
  };
  gamedb.get('games').push(game).write();
  return game;
}

function updateGame(currentGame, gamedata) {
  const entry = Object.assign({}, currentGame, {
    endtime: Date.now(),
    score: gamedata.score,
  });
  gamedb
    .get('games')
    .find({ gameid: currentGame.gameid })
    .assign(entry)
    .write();
}

function updateUser(user) {
  playerdb
    .get('players')
    .find({ userid: user.userid })
    .assign(user)
    .write();
}

function getAllPlayers() {
  return playerdb
    .get('players')
    .value();
}

function getAllGames() {
  return gamedb
    .get('games')
    .value();
}

function getAllEntries() {
  return entrydb
    .get('entries')
    .value();
}

function removeGame(currentGame) {
  gamedb.get('games')
    .remove({ gameid: currentGame.gameid })
    .write();
}

function removeEntries(currentGame) {
  entrydb.get('entries')
    .remove({ gameid: currentGame.gameid })
    .write();
}

module.exports = {
  getOrCreateUser,
  updateUser,
  getAllPlayers,
  createGame,
  updateGame,
  createEntries,
  getAllGames,
  getAllEntries,
  removeGame,
  removeEntries,
};
