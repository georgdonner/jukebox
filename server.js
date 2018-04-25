const path = require('path');
const express = require('express');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({ users: [], current: {} })
  .write();

require('dotenv').config();

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
  socket.emit('news', { hello: 'world' });
  socket.on('disconnect', () => {
    db.get('users')
      .remove({ id: socket.id })
      .write();
  });
});
