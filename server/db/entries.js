const { getDb, generateId } = require('./lowdb');

const entries = getDb('entries', { entries: [] });

function get(entryid) {
  return entries.find({ entryid }).value();
}

function getAll() {
  return entries.value();
}

function create({
  gameid, speed, cadence, power, duration,
}) {
  const entry = {
    entryid: generateId(),
    gameid,
    speed,
    cadence,
    power,
    duration,
    time: Date.now(),
  };
  entries.push(entry).write();
  return get(entry.entryid);
}

function removeAllFromGame(gameid) {
  return entries.remove({ gameid }).write();
}

module.exports = {
  get, getAll, create, removeAllFromGame,
};
