const { getDb, generateId } = require('./lowdb');

const players = getDb('players', { players: [] });

function get(query) {
  return players.find(query).value();
}

function getAll() {
  return players.value();
}

function create({
  cardid = '', name = '', email = '', contact = false,
}) {
  const player = {
    userid: generateId(), cardid, name, email, contact,
  };
  players.push(player).write();
  return get({ userid: player.userid });
}

function update(player) {
  players.find({ userid: player.userid }).assign(player).write();
  return get({ userid: player.userid });
}

function remove(userid) {
  return players.remove({ userid }).write();
}

module.exports = {
  get, getAll, create, update, remove,
};
