/* eslint-disable no-shadow, no-use-before-define */
import io from 'socket.io-client';
import { h, app } from 'hyperapp';
import actions from './store/actions';
import state from './store/state';
import Username from './components/username';
import Current from './components/current';
import Controls from './components/controls';
import Input from './components/input';
import Queue from './components/queue';
import SortableQueue from './components/sortableQueue';
import './scss/main.scss';

const socket = io.connect();
socket.on('queue update', (newState) => {
  main.updateSearchResults(null);
  main.queueStateUpdate(newState);
});
socket.on('playing', (isPlaying) => {
  main.current.setPlaying(isPlaying);
});
socket.on('search results', (results) => {
  main.updateSearchResults(results);
});

const view = (state, actions) => {
  const setUsername = (username) => {
    actions.submitUsername();
    socket.emit('username', username);
  };
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

  return state.usernameSubmitted ? mainView : <Username onSubmit={setUsername} />;
};

const main = app(state, actions, view, document.body);
