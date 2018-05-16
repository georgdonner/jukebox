module.exports = (io, db, spotify) => {
  io.on('connection', (socket) => {
    socket.on('username', (username) => {
      try {
        db.addUser(username);
        socket.emit('username changed', username);
        socket.emit('queue update', db.getState());
      } catch (error) {
        socket.emit('server error', error.message);
      }
    });

    socket.on('new track', async ({ username, uri }) => {
      const info = await spotify.getTrackInfo(uri);
      db.addTrack(username, info);
      io.emit('queue update', db.getState());
    });

    socket.on('play', () => {
      const state = db.getState();
      if (state.current.track) {
        spotify.play();
        db.setPlaying(true);
        io.emit('playing', true);
      } else {
        const next = db.nextTrack();
        if (next) {
          spotify.play(next.uri);
          db.setPlaying(true);
          io.emit('queue update', db.getState());
        }
      }
    });

    socket.on('pause', () => {
      spotify.pause();
      db.setPlaying(false);
      io.emit('playing', false);
    });

    socket.on('next', () => {
      const next = db.nextTrack();
      if (next) {
        spotify.play(next.uri);
        io.emit('queue update', db.getState());
      }
    });

    socket.on('search', async (input) => {
      const results = await spotify.search(input);
      socket.emit('search results', results);
    });

    socket.on('reorder queue', ({ username, oldIndex, newIndex }) => {
      db.updateQueue(username, oldIndex, newIndex);
      io.emit('queue update', db.getState());
    });

    socket.on('remove track', ({ username, trackId }) => {
      db.removeTrack(username, trackId);
      io.emit('queue update', db.getState());
    });
  });
  return io;
};
