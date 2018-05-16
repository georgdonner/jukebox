/* eslint-disable no-shadow, no-use-before-define */
import io from 'socket.io-client';
import { h, app } from 'hyperapp';
import actions from './store/actions';
import state from './store/state';
import Username from './components/username';
import Error from './components/error';
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
socket.on('username changed', () => main.confirmUsername());
socket.on('server error', (error) => {
  main.setError(error);
});

const view = (state, actions) => {
  const setUsername = username => socket.emit('username', username);
  const submitTrack = (uri) => {
    const trackUri = uri || state.trackInput;
    actions.setTrackInput('');
    if (state.queue.find(item => item.track.uri === trackUri)) {
      actions.setError('This song is already in queue.');
      actions.updateSearchResults(null);
    } else {
      socket.emit('new track', { username: state.username, uri: trackUri });
    }
  };
  const playPause = () => {
    if (!state.current.isPlaying) socket.emit('play');
    else socket.emit('pause');
  };
  const nextTrack = () => socket.emit('next');
  const reorderQueue = (oldIndex, newIndex) => socket.emit('reorder queue', { username: state.username, oldIndex, newIndex });
  const removeTrack = trackId => socket.emit('remove track', { username: state.username, trackId });
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
        current={state.current}
      />
      <Input
        onSubmit={submitTrack}
        onSearch={search}
      />
      {state.allTracks ?
        <Queue /> :
        <SortableQueue
          user={state.users.find(user => user.name === state.username)}
          onReorder={reorderQueue}
          onRemove={removeTrack}
        />}
    </main>
  ) : <div>Loading...</div>;
  const content = state.usernameConfirmed ? mainView : <Username onSubmit={setUsername} />;

  return (
    <div id="outer-wrapper">
      <Error />
      {content}
    </div>
  );
};

const main = app(state, actions, view, document.body);
