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
  if (current.track && (!playback.item || !playback.is_playing)) {
    const next = db.nextTrack();
    if (next) {
      spotify.play(next.uri);
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
    } else {
      const next = db.nextTrack();
      if (next) {
        spotify.play(next.uri);
        io.emit('queue update', db.getState());
      }
    }
  });

  socket.on('pause', () => spotify.pause());

  socket.on('next', () => {
    const next = db.nextTrack();
    if (next) {
      spotify.play(next.uri);
      io.emit('queue update', db.getState());
    }
  });

  socket.on('disconnect', () => {
    db.removeUser(socket.id);
  });
});
