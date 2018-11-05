const { getDb, generateId } = require('./lowdb');

const players = getDb('players', { players: [] });

function get(userid) {
  return players.find({ userid }).value();
}

function getAll() {
  return players.value();
}

function create({ cardid }) {
  const player = {
    userid: generateId(),
    cardid,
    name: '',
  };
  players.push(player).write();
  return get(player.userid);
}

function update(player) {
  players.find({ userid: player.userid }).assign(player).write();
  return get(player.userid);
}

function remove(userid) {
  return players.remove({ userid }).write();
}

module.exports = {
  get, getAll, create, update, remove,
};
