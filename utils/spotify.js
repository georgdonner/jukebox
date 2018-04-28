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
}

module.exports = Spotify;
