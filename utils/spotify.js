const request = require('request-promise-native');

class Spotify {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  getTrackInfo(uri) {
    const id = uri.split(':')[2];
    return request.get(`https://api.spotify.com/v1/tracks/${id}`, {
      auth: { bearer: this.accessToken },
      json: true,
    });
  }

  async getPlayback() {
    const playback = await request.get('https://api.spotify.com/v1/me/player/currently-playing', {
      auth: { bearer: this.accessToken },
      json: true,
    });
    return playback;
  }

  play(uri) {
    const options = {
      auth: { bearer: this.accessToken },
      json: true,
    };
    if (uri) options.body = { uris: [uri] };
    request.put('https://api.spotify.com/v1/me/player/play', options);
  }

  pause() {
    request.put('https://api.spotify.com/v1/me/player/pause', {
      auth: { bearer: this.accessToken },
    });
  }

  async updateToken() {
    const data = await request.post('https://accounts.spotify.com/api/token', {
      form: {
        grant_type: 'refresh_token',
        refresh_token: process.env.REFRESH_TOKEN,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      },
      json: true,
    });
    this.accessToken = data.access_token;
    return {
      accessToken: data.access_token,
      expires: data.expires_in + Date.now(),
    };
  }
}

module.exports = Spotify;
