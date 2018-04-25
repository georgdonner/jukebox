const fs = require('fs');
const express = require('express');
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
  const formatted = [
    `ACCESS_TOKEN=${data.access_token}`,
    `REFRESH_TOKEN=${data.refresh_token}`,
    `EXPIRES=${Date.now() + data.expires_in}`,
  ];
  const env = fs.readFileSync('.env', 'utf8');
  const lines = env.split('\n');
  const filtered = lines.filter(line => (
    !line.includes('ACCESS_TOKEN') && !line.includes('REFRESH_TOKEN') && !line.includes('EXPIRES')
  ));
  if (lines.length !== filtered.length) {
    fs.writeFileSync('.env', filtered.join('\n'));
  }
  fs.appendFile('.env', `\n${formatted.join('\n')}`, (err) => {
    if (err) throw err;
    else {
      // eslint-disable-next-line no-console
      console.log('Successfully saved authentication data.');
      process.exit();
    }
  });
});

app.get('/', (req, res) => {
  res.send('Auth successful!');
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Please open http://localhost:${port}/login in your browser.`);
});
