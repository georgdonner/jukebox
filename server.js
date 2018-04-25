const path = require('path');
const express = require('express');
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
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', (data) => {
    console.log(data);
  });
});
