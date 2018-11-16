const { NFC } = require('nfc-pcsc');

const listeners = [];

console.log('reader:starting');
const nfc = new NFC();
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
