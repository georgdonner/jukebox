require('dotenv').config();

if (!process.env.ACCESS_TOKEN) throw Error('No access token provided');

const path = require('path');
const express = require('express');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const QueueDb = require('./utils/queueDb');
const Spotify = require('./utils/spotify');

const adapter = new FileSync('db.json');
const lowdb = low(adapter);
const db = new QueueDb(lowdb);

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
  socket.on('username', (data) => {
    db.addUser(socket.id, data.username);
  });

  socket.on('new track', async (track) => {
    const info = await spotify.getTrackInfo(track.uri);
    db.addTrack(socket.id, info);
    socket.emit('queue update', db.getState());
  });

  socket.on('disconnect', () => {
    db.removeUser();
  });
});
