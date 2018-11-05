const { getDb, generateId } = require('./lowdb');

const games = getDb('games', { games: [] });

function get(gameid) {
  return games.find({ gameid }).value();
}

function getAll() {
  return games.value();
}

function create({ userid }) {
  const game = {
    userid,
    gameid: generateId(),
    starttime: Date.now(),
    endtime: '',
    score: 0,
  };
  games.push(game).write();
  return get(game.gameid);
}

function update(game) {
  games.find({ gameid: game.gameid }).assign(game).write();
  return get(game.gameid);
}

function remove(gameid) {
  return games.remove({ gameid }).write();
}

function end({ gameid, score }) {
  const game = get(gameid);
  Object.assign(game, {
    endtime: Date.now(),
    score,
  });
  return update(game);
}

module.exports = {
  get, getAll, create, update, remove, end,
};
