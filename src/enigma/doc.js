const enigma = require('enigma.js');
const schema = require('enigma.js/schemas/12.20.0.json');

const url = 'ws://localhost:9076/app';
const host_hostname = 'docker.for.mac.localhost';
let currentDoc = null;
const objectCache = {};

const docMixin = {
  types: ['Doc'],
  extend: {
    getOrCreateObjectLayout(name, def) {
      objectCache[name] = objectCache[name] || this.createSessionObject(def);
      return objectCache[name].then(obj => obj.getLayout());
    },

    getHighScore() {
      return this.getOrCreateObjectLayout('highscore', {
        qInfo: {
          qType: 'highscore',
        },
        qHyperCubeDef: {
          qDimensions: [
            { qDef: { qFieldDefs: ['name'] } },
            {
              qDef: {
                qFieldDefs: ['score'],
                qReverseSort: true,
                qSortCriterias: [{ qSortByNumeric: true }],
              },
            },
          ],
          qInitialDataFetch: [{
            qWidth: 2,
            qHeight: 10,
          }],
          qInterColumnSortOrder: [1, 0],
        },
      });
    },

    getScoresPerPlayer() {
      return this.getOrCreateObjectLayout('scores-per-player', {
        qInfo: {
          qType: 'scores',
        },
        qHyperCubeDef: {
          qDimensions: [
            { qDef: { qFieldDefs: ['=Timestamp(Timestamp(\'1970-01-01 00:00:00.000\') + [time]/1000/60/60/24)'] } },
            { qDef: { qFieldDefs: ['name'] } },
          ],
          qMeasures: [
            { qDef: { qDef: 'AVG(speed)' } },
          ],
          qInitialDataFetch: [{
            qWidth: 3,
            qHeight: 1000,
          }],
          qInterColumnSortOrder: [1, 0, 2],
        },
      });
    },
  },
};

async function getNewDoc() {
  const session = enigma.create({ url, schema, mixins: [docMixin] });
  const global = await session.open();
  const doc = await global.createSessionApp();

  await Promise.all([
    doc.createConnection({
      qType: 'internet',
      qName: 'players',
      qConnectionString: `http://${host_hostname}:8081/csv/players`,
    }),
    doc.createConnection({
      qType: 'internet',
      qName: 'games',
      qConnectionString: `http://${host_hostname}:8081/csv/games`,
    }),
    doc.createConnection({
      qType: 'internet',
      qName: 'entries',
      qConnectionString: `http://${host_hostname}:8081/csv/entries`,
    }),
  ]);

  const script = `
[games]:
LOAD *
FROM [lib://games]
(txt, codepage is 1252, embedded labels, delimiter is ',', msq);

[players]:
LOAD *
FROM [lib://players]
(txt, utf8, embedded labels, delimiter is ',', msq);

[entries]:
LOAD *
FROM [lib://entries]
(txt, codepage is 1252, embedded labels, delimiter is ',', msq);
  `;

  await doc.setScript(script);
  await doc.doReload();
  return doc;
}

export default async function getDoc() {
  if (!currentDoc) {
    currentDoc = getNewDoc();
  }
  return currentDoc;
}
