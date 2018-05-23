module.exports.handleSpotifyError = (socket, error) => {
  if (error.response && error.response.body) {
    const { message } = error.response.body.error;
    socket.emit('server error', message);
  } else {
    socket.emit('server error', error.message);
  }
};
