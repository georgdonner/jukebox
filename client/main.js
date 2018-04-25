import io from 'socket.io-client';

const socket = io.connect('http://localhost:8080');
socket.on('news', (data) => {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
});
