module.exports = async (io, db, spotify) => {
  const auth = db.getCredentials();
  if (auth.expires - 10000 < Date.now()) {
    const credentials = await spotify.updateToken();
    db.setCredentials(credentials);
  }
  const playback = await spotify.getPlayback();
  const { current } = db.getState();
  if (playback && (current.isPlaying !== playback.is_playing)) {
    db.setPlaying(playback.is_playing);
    io.emit('playing', playback.is_playing);
  }
  if (current.track &&
      (playback && playback.progress_ms === 0) &&
      (!playback || !playback.item || !playback.is_playing)
  ) {
    const next = db.nextTrack();
    if (next) {
      spotify.play(next.uri);
      db.setPlaying(true);
      io.emit('queue update', db.getState());
    }
  }
};
