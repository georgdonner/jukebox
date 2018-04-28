const fs = require('fs');
const express = require('express');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const request = require('request-promise-native');
require('dotenv').config();

const scopes = [
  'user-read-currently-playing',
  'user-modify-playback-state',
].join(' ');

const app = express();
const port = 8000;
const redirect = `http://localhost:${port}/token`;

app.get('/login', (req, res) => {
  const base = 'https://accounts.spotify.com/authorize';
  /* eslint-disable prefer-template */
  const url = base +
    '?response_type=code' +
    '&client_id=' + process.env.CLIENT_ID +
    '&scope=' + encodeURIComponent(scopes) +
    '&redirect_uri=' + encodeURIComponent(redirect);
  res.redirect(url);
});

const saveCredentials = (data) => {
  const adapter = new FileSync('db.json');
  const db = low(adapter);
  db.defaults({ users: [], current: {}, credentials: {} })
    .write();
  const credentials = {
    accessToken: data.access_token,
    expires: Date.now() + data.expires_in,
  };
  db.get('credentials')
    .assign(credentials)
    .write();
};

app.get('/token', async (req) => {
  const { code } = req.query;
  const data = await request.post('https://accounts.spotify.com/api/token', {
    form: {
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirect,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    },
    json: true,
  });
  saveCredentials(data);
  fs.appendFile('.env', `\nREFRESH_TOKEN=${data.refresh_token}`, (err) => {
    if (err) throw err;
    else {
      // eslint-disable-next-line no-console
      console.log('Successfully saved authentication data.');
      process.exit();
    }
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Please open http://localhost:${port}/login in your browser.`);
});
