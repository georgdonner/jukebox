const errors = require('./errors');

module.exports = (io, db, spotify) => {
  io.on('connection', (socket) => {
    socket.emit('session status', db.getSession().active);

    const handleUsername = (username) => {
      try {
        db.addUser(username);
        socket.emit('username changed', username);
        socket.emit('queue update', db.getState());
      } catch (error) {
        socket.emit('server error', error.message);
      }
    };

    socket.on('session login', (password) => {
      if (password === process.env.SESSION_PASSWORD) {
        db.activateSession();
        io.emit('session status', true);
        handleUsername('admin');
      } else {
        socket.emit('server error', 'Invalid password');
      }
    });

    socket.on('session leave', (username) => {
      db.removeUser(username);
      io.emit('queue update', db.getState());
    });

    socket.on('username', username => handleUsername(username));

    socket.on('new track', async ({ username, uri }) => {
      try {
        const info = await spotify.getTrackInfo(uri);
        db.addTrack(username, info);
        io.emit('queue update', db.getState());
      } catch (error) {
        errors.handleSpotifyError(socket, error);
      }
    });

    socket.on('play', async () => {
      try {
        const state = db.getState();
        if (state.current.track) {
          await spotify.play();
          db.setPlaying(true);
          io.emit('playing', true);
        } else {
          const next = db.getNext();
          if (next) {
            await spotify.play(next.uri);
            db.setNextToCurrent();
            db.setPlaying(true);
            io.emit('queue update', db.getState());
          }
        }
      } catch (error) {
        errors.handleSpotifyError(socket, error);
      }
    });

    socket.on('pause', () => {
      try {
        spotify.pause();
        db.setPlaying(false);
        io.emit('playing', false);
      } catch (error) {
        errors.handleSpotifyError(socket, error);
      }
    });

    socket.on('next', async () => {
      try {
        const next = db.getNext();
        if (next) {
          await spotify.play(next.uri);
          db.setNextToCurrent();
          io.emit('queue update', db.getState());
        }
      } catch (error) {
        errors.handleSpotifyError(socket, error);
      }
    });

    socket.on('search', async (input) => {
      try {
        const results = await spotify.search(input);
        socket.emit('search results', results);
      } catch (error) {
        errors.handleSpotifyError(socket, error);
      }
    });

    socket.on('reorder queue', ({ username, oldIndex, newIndex }) => {
      db.updateQueue(username, oldIndex, newIndex);
      io.emit('queue update', db.getState());
    });

    socket.on('remove track', ({ username, trackId }) => {
      db.removeTrack(username, trackId);
      io.emit('queue update', db.getState());
    });

    // eslint-disable-next-line no-console
    socket.on('error', error => console.error(error));
  });
  return io;
};
