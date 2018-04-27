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
}

module.exports = Spotify;
