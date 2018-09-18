const lowdb = require('lowdb');
const fs = require('fs');
const path = require('path');
const FileSync = require('lowdb/adapters/FileSync');

// const playerdb = require('./lowdb').getInstance('players', { players: [] });
// const gamedb = require('./lowdb').getInstance('games', { games: [] });
// const entrydb = require('./lowdb').getInstance('entries', { entries: [] });

// exports.getInstance = (name, defaults) => {
//     const databaseFolder = path.join(__dirname, '../', 'database/');
//     if (!fs.existsSync(databaseFolder)) {
//         fs.mkdirSync(databaseFolder);
//     }
//     const adapter = new FileSync(path.join(databaseFolder, name + '.json'));
//     const db = lowdb(adapter);
//     db.defaults(defaults).write();
//     return db
// }


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

function getOrCreateUser(id) {
  const player = { userid: id, name: '' };
  const result = playerdb.get('players').find({ userid: id }).value();
  if (!result) {
    playerdb.get('players').push(player).write();
  } else {
    player.name = result.name;
  }
  return player;
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

module.exports = {
  getOrCreateUser,
  updateUser,
  getAllPlayers,
};
