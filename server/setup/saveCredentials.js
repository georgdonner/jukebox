const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const dbDefaults = require('../config/dbDefaults');

module.exports = (data) => {
  const adapter = new FileSync('db.json');
  const db = low(adapter);
  db.defaults(dbDefaults)
    .write();
  const credentials = {
    accessToken: data.access_token,
    expires: (data.expires_in * 1000) + Date.now(),
  };
  db.get('credentials')
    .assign(credentials)
    .write();
};
