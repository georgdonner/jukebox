require('dotenv').config();
const request = require('request-promise-native');
const saveCredentials = require('./saveCredentials');

const refresh = async () => {
  const data = await request.post('https://accounts.spotify.com/api/token', {
    form: {
      grant_type: 'refresh_token',
      refresh_token: process.env.REFRESH_TOKEN,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    },
    json: true,
  });
  saveCredentials(data);
  // eslint-disable-next-line no-console
  console.log('Successfully refreshed credentials.');
};

refresh();
