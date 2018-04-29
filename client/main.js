/* eslint-disable no-shadow */
import io from 'socket.io-client';
// eslint-disable-next-line no-unused-vars
import { h, app } from 'hyperapp';

const socket = io.connect();
socket.on('queue update', (state) => {
  // eslint-disable-next-line no-use-before-define
  main.updateState(state);
});
socket.on('playing', (isPlaying) => {
  // eslint-disable-next-line no-use-before-define
  main.setPlaying(isPlaying);
});

const state = {
  username: null,
  usernameSubmitted: false,
  trackInput: '',
};

const actions = {
  updateState: upd => () => (upd),
  setUsername: username => () => ({ username }),
  submitUsername: () => () => ({ usernameSubmitted: true }),
  setTrackInput: input => () => ({ trackInput: input }),
  setPlaying: isPlaying => () => ({ current: { isPlaying } }),
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
  const playPause = () => {
    if (!state.current.isPlaying) socket.emit('play');
    else socket.emit('pause');
  };
  const nextTrack = () => {
    socket.emit('next');
  };
  const queue = state.queue ? state.queue.map(({ track, user }, index) => (
    <li key={track.id}>
      <b>{`${index + 1}: `}</b>
      {`${track.name} - ${track.artists[0].name}, added by ${user}`}
    </li>
  )) : null;
  const mainView = state.current && state.queue ? (
    <div>
      <input
        type="text"
        placeholder="Enter a Spotify URI"
        value={state.trackInput}
        oninput={(e) => { actions.setTrackInput(e.target.value); }}
        onkeypress={submitTrack}
      />
      <button type="button" onclick={playPause}>
        {state.current.isPlaying ? 'Pause' : 'Play'}
      </button>
      {state.queue.length > 0 ? (
        <button type="button" onclick={nextTrack}>Next</button>
      ) : null}
      <ul>
        {queue}
      </ul>
    </div>
  ) : <div>Loading...</div>;
  const screen = state.usernameSubmitted ? mainView : input;
  return (
    <div>
      {screen}
    </div>
  );
};

const main = app(state, actions, view, document.body);
