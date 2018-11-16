const { NFC } = require('nfc-pcsc');

const listeners = [];

const logger = {
  log: (...args) => (console.log(args)),
  debug: (...args) => (console.log(args)),
  info: (...args) => (console.log(args)),
  warn: (...args) => (console.log(args)),
  error: (...args) => (console.log(args)),
};

console.log('reader:starting');
const nfc = new NFC(logger);
console.log('reader:started');

nfc.on('reader', (reader) => {
  console.log('reader:attached');
  reader.on('card', (card) => { listeners.forEach(l => l(card)); });
  reader.on('error', (err) => { console.error('reader:error', err); });
});

nfc.on('error', (err) => { console.error('nfc:error', err); });

module.exports = {
  on: (evt, fn) => { listeners.push(fn); },
};
