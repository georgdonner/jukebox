require('dotenv').config();

if (!process.env.ACCESS_TOKEN) throw Error('No access token provided');

const path = require('path');
const express = require('express');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const Spotify = require('./utils/spotify');

const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({ users: [], current: {} })
  .write();

const spotify = new Spotify(process.env.ACCESS_TOKEN);

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const port = 8080;

server.listen(port);

app.use(express.static(path.resolve('build')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('build', 'index.html'));
});

io.on('connection', (socket) => {
  db.get('users')
    .push({ id: socket.id, queue: [] })
    .write();
  socket.on('new track', async (track) => {
    const info = await spotify.getTrackInfo(track.uri);
    db.get('users')
      .find({ id: socket.id })
      .get('queue')
      .push(info)
      .write();
  });
  socket.on('disconnect', () => {
    db.get('users')
      .remove({ id: socket.id })
      .write();
  });
});
