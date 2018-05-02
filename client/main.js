/* eslint-disable no-shadow, no-use-before-define */
import io from 'socket.io-client';
// eslint-disable-next-line no-unused-vars
import { h, app } from 'hyperapp';
import Current from './components/current';
import Controls from './components/controls';
import Input from './components/input';
import Queue from './components/queue';
import SortableQueue from './components/sortableQueue';
import './scss/main.scss';

const socket = io.connect();
socket.on('queue update', (state) => {
  // hard reset to trigger a full re-render
  main.updateState({ queue: null, users: null });
  setTimeout(() => {
    main.updateState(state);
  }, 0);
});
socket.on('playing', (isPlaying) => {
  main.current.setPlaying(isPlaying);
});

const state = {
  username: null,
  usernameSubmitted: false,
  trackInput: '',
  allTracks: true,
};

const actions = {
  updateState: upd => () => (upd),
  setUsername: username => () => ({ username }),
  submitUsername: () => () => ({ usernameSubmitted: true }),
  setTrackInput: input => () => ({ trackInput: input }),
  current: {
    setPlaying: isPlaying => () => ({ isPlaying }),
  },
  toggleQueue: () => state => ({ allTracks: !state.allTracks }),
};

const view = (state, actions) => {
  const changeUsername = (e) => {
    if (e.keyCode === 13) { // ENTER
      actions.submitUsername();
      socket.emit('username', { username: state.username });
    }
  };
  const input = (
    <div id="username-container">
      <input
        type="text"
        placeholder="Enter your username"
        value={state.username}
        oninput={(e) => { actions.setUsername(e.target.value); }}
        onkeypress={changeUsername}
      />
    </div>
  );
  const submitTrack = () => socket.emit('new track', { uri: state.trackInput });
  const playPause = () => {
    if (!state.current.isPlaying) socket.emit('play');
    else socket.emit('pause');
  };
  const nextTrack = () => socket.emit('next');
  const reorderQueue = (oldIndex, newIndex) => socket.emit('reorder queue', oldIndex, newIndex);

  const current = state.current && state.current.track ? (
    <Current track={state.current.track} />
  ) : null;
  const mainView = state.current && state.queue ? (
    <main>
      {current}
      <Controls
        toggle={playPause}
        next={nextTrack}
        queue={state.queue}
        playing={state.current.isPlaying}
      />
      <Input onSubmit={submitTrack} />
      {state.allTracks ?
        <Queue /> :
        <SortableQueue
          user={state.users.find(user => user.id === socket.id)}
          onReorder={reorderQueue}
        />}
    </main>
  ) : <div>Loading...</div>;

  return state.usernameSubmitted ? mainView : input;
};

const main = app(state, actions, view, document.body);
