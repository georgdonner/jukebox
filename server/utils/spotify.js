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

  getPlayback() {
    return request.get('https://api.spotify.com/v1/me/player/currently-playing', {
      auth: { bearer: this.accessToken },
      json: true,
    });
  }

  play(uri) {
    const options = {
      auth: { bearer: this.accessToken },
      json: true,
    };
    if (uri) options.body = { uris: [uri] };
    return request.put('https://api.spotify.com/v1/me/player/play', options);
  }

  playContext(context) {
    const options = {
      auth: { bearer: this.accessToken },
      json: true,
      body: { context_uri: context.uri },
    };
    const contextType = context.uri.split(':')[1];
    if (contextType !== 'artist') options.body.uri = context.trackUri;
    return request.put('https://api.spotify.com/v1/me/player/play', options);
  }

  pause() {
    return request.put('https://api.spotify.com/v1/me/player/pause', {
      auth: { bearer: this.accessToken },
    });
  }

  next() {
    return request.post('https://api.spotify.com/v1/me/player/next', {
      auth: { bearer: this.accessToken },
    });
  }

  async search(input, offset) {
    const res = await request.get('https://api.spotify.com/v1/search', {
      auth: { bearer: this.accessToken },
      qs: {
        q: input,
        type: 'track',
        offset,
      },
      json: true,
    });
    return res.tracks.items;
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
      expires: (data.expires_in * 1000) + Date.now(),
    };
  }
}

module.exports = Spotify;
