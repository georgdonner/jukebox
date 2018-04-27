import io from 'socket.io-client';

const socket = io.connect('http://localhost:8080');
socket.emit('new track', { uri: 'spotify:track:3EI5hCVItB6s7v6APkYJUW' });
