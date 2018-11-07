/* eslint no-bitwise:0,no-mixed-operators:0,no-param-reassign:0,no-console:0 */

const fs = require('fs');

const players = require(`${__dirname}/../../../database/players.json`);

players.players.forEach((p) => {
  if (!p.contact) {
    p.contact = false;
  }
  if (!p.email) {
    p.email = '';
  }
});

fs.writeFileSync(`${__dirname}/../../../database/players.json`, JSON.stringify(players, null, '  '));

console.log('db updated');
