const lowdb = require('lowdb');
const fs = require('fs');
const path = require('path');
const FileSync = require('lowdb/adapters/FileSync');
const shortid = require('shortid');

module.exports = {
  getDb: (name, defaults) => {
    const databaseFolder = path.join(__dirname, '../../', 'database/');
    if (!fs.existsSync(databaseFolder)) {
      fs.mkdirSync(databaseFolder);
    }
    const adapter = new FileSync(path.join(databaseFolder, `${name}.json`));
    const db = lowdb(adapter);
    db.defaults(defaults).write();
    return db.get(name);
  },
  generateId: shortid.generate,
};
