const errors = require('./errors');

module.exports = async (io, db, spotify) => {
  const auth = db.getCredentials();
  if (auth.expires - 10000 < Date.now()) {
    const credentials = await spotify.updateToken();
    db.setCredentials(credentials);
  }
  const playback = await spotify.getPlayback();
  const { current } = db.getState();
  if (playback) {
    if (current.isPlaying !== playback.is_playing) {
      // read is playing status from response
      db.setPlaying(playback.is_playing);
      io.emit('playing', playback.is_playing);
    }
    if (playback.context) {
      // save previous context to continue playback after queue is empty
      db.setContext({ uri: playback.context.uri, trackUri: playback.item.uri });
    }
  }
  try {
    const currentTrackId = current.track ? current.track.id : null;
    const next = db.getNext();
    const playNext = async () => {
      await spotify.play(next.uri);
      db.setNextToCurrent();
      db.setExternal(false);
      db.setPlaying(true);
      io.emit('queue update', db.getState());
    };
    if (next && db.isExternal() && playback &&
        playback.progress_ms && (playback.item.duration_ms - playback.progress_ms < 5500)
    ) {
      // tracks in queue have priority over current playback
      playNext();
    } else if
    (current.track &&
      (playback && playback.progress_ms === 0) &&
      (!playback || !playback.item || !playback.is_playing)
    ) {
      // playback has stopped
      const context = db.getContext();
      if (next) {
        playNext();
      } else if (context && !playback.is_playing) {
        // continue playback with initial context
        await spotify.playContext(context);
        await spotify.next();
        db.setExternal(true);
        db.setPlaying(true);
      }
    } else if (playback.item && (currentTrackId !== playback.item.id)) {
      // playback has changed
      db.setCurrentTrack(playback.item);
      io.emit('queue update', db.getState());
    }
  } catch (error) {
    errors.handleSpotifyError(io, error);
  }
};
