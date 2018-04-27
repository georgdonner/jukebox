/* eslint-disable no-shadow */
import io from 'socket.io-client';
// eslint-disable-next-line no-unused-vars
import { h, app } from 'hyperapp';

const socket = io.connect('http://localhost:8080');
// socket.emit('new track', { uri: 'spotify:track:3EI5hCVItB6s7v6APkYJUW' });
socket.on('queue update', (state) => {
  console.log(state);
});

const state = {
  username: null,
  usernameSubmitted: false,
};

const actions = {
  updateState: upd => () => (upd),
  setUsername: username => () => ({ username }),
  submitUsername: () => () => ({ usernameSubmitted: true }),
};

const view = (state, actions) => {
  const changeUsername = (e) => {
    if (e.keyCode === 13) { // ENTER
      actions.submitUsername();
      socket.emit('username', { username: state.username });
    }
  };
  const input = (
    <input
      type="text"
      placeholder="username"
      oninput={(e) => { actions.setUsername(e.target.value); }}
      onkeypress={changeUsername}
    />
  );
  const screen = state.usernameSubmitted ? <h1>Welcome!</h1> : input;
  return (
    <div>
      {screen}
    </div>
  );
};

app(state, actions, view, document.body);
