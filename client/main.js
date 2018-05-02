/* eslint-disable no-shadow, no-use-before-define */
import io from 'socket.io-client';
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
  main.updateState({ queue: null, users: null, searchResults: null });
  setTimeout(() => {
    main.updateState(state);
  }, 0);
});
socket.on('playing', (isPlaying) => {
  main.current.setPlaying(isPlaying);
});
socket.on('search results', (results) => {
  main.updateSearchResults(results);
});

const state = {
  username: null,
  usernameSubmitted: false,
  trackInput: '',
  allTracks: true,
  timeout: null,
};

const actions = {
  updateState: upd => () => (upd),
  setUsername: username => () => ({ username }),
  submitUsername: () => () => ({ usernameSubmitted: true }),
  setTrackInput: input => () => ({ trackInput: input }),
  setTimeout: timeout => () => ({ timeout }),
  current: {
    setPlaying: isPlaying => () => ({ isPlaying }),
  },
  toggleQueue: () => state => ({ allTracks: !state.allTracks }),
  updateSearchResults: searchResults => () => ({ searchResults }),
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
  const submitTrack = (uri) => {
    actions.setTrackInput('');
    socket.emit('new track', uri || state.trackInput);
  };
  const playPause = () => {
    if (!state.current.isPlaying) socket.emit('play');
    else socket.emit('pause');
  };
  const nextTrack = () => socket.emit('next');
  const reorderQueue = (oldIndex, newIndex) => socket.emit('reorder queue', oldIndex, newIndex);
  const removeTrack = trackId => socket.emit('remove track', trackId);
  const search = (input) => {
    socket.emit('search', input);
  };

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
      <Input
        onSubmit={submitTrack}
        onSearch={search}
      />
      {state.allTracks ?
        <Queue /> :
        <SortableQueue
          user={state.users.find(user => user.id === socket.id)}
          onReorder={reorderQueue}
          onRemove={removeTrack}
        />}
    </main>
  ) : <div>Loading...</div>;

  return state.usernameSubmitted ? mainView : input;
};

const main = app(state, actions, view, document.body);
