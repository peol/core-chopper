const lowdb = require('lowdb')
const fs = require('fs');
const path = require('path')
const FileSync = require('lowdb/adapters/FileSync')

// exports.getInstance = (name, defaults) => {
//     const databaseFolder = path.join(__dirname, '../', 'database/');
//     if (!fs.existsSync(databaseFolder)) {
//         fs.mkdirSync(databaseFolder);
//     }
//     const adapter = new FileSync(path.join(databaseFolder, name + '.json'));
//     const db = lowdb(adapter);
//     db.defaults(defaults).write();
//     return db
// }


function Lowdb(name, defaults) {
    const databaseFolder = path.join(__dirname, '../', 'database/');
    if (!fs.existsSync(databaseFolder)) {
        fs.mkdirSync(databaseFolder);
    }
    const adapter = new FileSync(path.join(databaseFolder, name + '.json'));
    const db = lowdb(adapter);
    db.defaults(defaults).write();
    return db;
}

module.exports = {
    Lowdb: Lowdb
}