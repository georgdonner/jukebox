const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

module.exports = (data) => {
  const adapter = new FileSync('db.json');
  const db = low(adapter);
  db.defaults({ users: [], current: {}, credentials: {} })
    .write();
  const credentials = {
    accessToken: data.access_token,
    expires: (data.expires_in * 1000) + Date.now(),
  };
  db.get('credentials')
    .assign(credentials)
    .write();
};
