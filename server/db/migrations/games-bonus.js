/* eslint no-bitwise:0,no-mixed-operators:0,no-param-reassign:0,no-console:0 */

const fs = require('fs');

const games = require(`${__dirname}/../../../database/games.json`);

games.games.forEach((p) => {
  if (!p.bonus) {
    p.bonus = 0;
  }
});

fs.writeFileSync(`${__dirname}/../../../database/games.json`, JSON.stringify(games, null, '  '));

console.log('db updated');
