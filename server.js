require('dotenv').config();

if (!process.env.REFRESH_TOKEN) throw Error('No refresh token provided');

const path = require('path');
const express = require('express');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const QueueDb = require('./utils/queueDb');
const Spotify = require('./utils/spotify');

const adapter = new FileSync('db.json');
const lowdb = low(adapter);
const db = new QueueDb(lowdb);

const { accessToken } = db.getCredentials();
const spotify = new Spotify(accessToken);

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const port = 8080;

server.listen(port);

app.use(express.static(path.resolve('build')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('build', 'index.html'));
});

setInterval(async () => {
  const auth = db.getCredentials();
  if (auth.expires < Date.now() - 10000) {
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
}, 5000);

io.on('connection', (socket) => {
  socket.on('username', (data) => {
    db.addUser(socket.id, data.username);
    socket.emit('queue update', db.getState());
  });

  socket.on('new track', async (track) => {
    const info = await spotify.getTrackInfo(track.uri);
    db.addTrack(socket.id, info);
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

  socket.on('reorder queue', (oldIndex, newIndex) => {
    db.updateQueue(socket.id, oldIndex, newIndex);
    io.emit('queue update', db.getState());
  });

  socket.on('remove track', (trackId) => {
    db.removeTrack(socket.id, trackId);
    io.emit('queue update', db.getState());
  });

  socket.on('disconnect', () => {
    db.removeUser(socket.id);
    io.emit('queue update', db.getState());
  });
});
