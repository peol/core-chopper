const enigma = require('enigma.js');
const schema = require('enigma.js/schemas/12.20.0.json');

const url = `ws://localhost:9076/app/${+new Date()}`;
// TODO: make this work for Linux as well:
// const isMac = process.execPath[0] === '/';
// const dockerHost = `docker.for.${isMac ? 'mac' : 'win'}.localhost`;
const dockerHost = 'docker.for.mac.localhost';
let currentDoc = null;
const objectCache = {};

const docMixin = {
  types: ['Doc'],
  extend: {
    async getOrCreateObject(name, def) {
      const fromCache = objectCache[name];
      if (fromCache) {
        // if we're in a dev environment, set properties here to ensure
        // the properties object is up-to-date:
        if (module.hot) {
          const model = await fromCache;
          model.setProperties(def);
        }
        return fromCache;
      }
      objectCache[name] = this.createSessionObject(def);
      return objectCache[name];
    },
  },
};

async function reload(global, doc) {
  await Promise.all([
    doc.createConnection({
      qType: 'internet',
      qName: 'players',
      qConnectionString: `http://${dockerHost}:8081/csv/players`,
    }),
    doc.createConnection({
      qType: 'internet',
      qName: 'games',
      qConnectionString: `http://${dockerHost}:8081/csv/games`,
    }),
    doc.createConnection({
      qType: 'internet',
      qName: 'entries',
      qConnectionString: `http://${dockerHost}:8081/csv/entries`,
    }),
  ]);

  const script = `
[games]:
LOAD *
FROM [lib://games]
(txt, codepage is 1252, embedded labels, delimiter is ',', msq)
;

[players]:
LOAD *
FROM [lib://players]
(txt, utf8, embedded labels, delimiter is ',', msq)
;

[entries]:
LOAD *
FROM [lib://entries]
(txt, codepage is 1252, embedded labels, delimiter is ',', msq)
;
  `;

  await doc.setScript(script);
  const success = await doc.doReload();
  if (!success) {
    const progress = await global.getProgress(-1);
    throw new Error(`Reload failed: ${progress.qPersistentProgress}`);
  }
}

async function getNewDoc() {
  const session = enigma.create({ url, schema, mixins: [docMixin] });
  const global = await session.open();
  const doc = await global.createSessionApp();
  await reload(global, doc);
  return doc;
}

export default function getDoc() {
  if (!currentDoc) {
    currentDoc = getNewDoc();
  }
  return currentDoc;
}
