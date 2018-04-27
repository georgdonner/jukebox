/* eslint-disable no-shadow */
import io from 'socket.io-client';
// eslint-disable-next-line no-unused-vars
import { h, app } from 'hyperapp';

const socket = io.connect('http://localhost:8080');
socket.on('queue update', (state) => {
  // eslint-disable-next-line no-use-before-define
  main.updateState(state);
});

const state = {
  username: null,
  usernameSubmitted: false,
  trackInput: '',
  merged: [],
};

const actions = {
  updateState: upd => () => (upd),
  setUsername: username => () => ({ username }),
  submitUsername: () => () => ({ usernameSubmitted: true }),
  setTrackInput: input => () => ({ trackInput: input }),
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
      value={state.username}
      oninput={(e) => { actions.setUsername(e.target.value); }}
      onkeypress={changeUsername}
    />
  );
  const submitTrack = (e) => {
    if (e.keyCode === 13) { // ENTER
      actions.setTrackInput('');
      socket.emit('new track', { uri: state.trackInput });
    }
  };
  const queue = state.merged.map(({ track, user }, index) => (
    <li key={track.id}>
      <b>{`${index + 1}: `}</b>
      {`${track.name} - ${track.artists[0].name}, added by ${user}`}
    </li>
  ));
  const mainView = (
    <div>
      <input
        type="text"
        placeholder="Enter a Spotify URI"
        value={state.trackInput}
        oninput={(e) => { actions.setTrackInput(e.target.value); }}
        onkeypress={submitTrack}
      />
      <ul>
        {queue}
      </ul>
    </div>
  );
  const screen = state.usernameSubmitted ? mainView : input;
  return (
    <div>
      {screen}
    </div>
  );
};

const main = app(state, actions, view, document.body);
