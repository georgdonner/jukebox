/* eslint-disable no-shadow, no-use-before-define */
import io from 'socket.io-client';
import { h, app } from 'hyperapp';
import actions from './store/actions';
import state from './store/state';
import SingleInput from './components/singleInput';
import Error from './components/error';
import Current from './components/current';
import Controls from './components/controls';
import Input from './components/input';
import Queue from './components/queue';
import SortableQueue from './components/sortableQueue';
import LeaveSession from './components/leaveSession';
import './scss/main.scss';

const socket = io.connect();
socket.on('session status', status => main.setSessionStatus(status));
socket.on('username changed', username => main.confirmUsername(username));
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
socket.on('server error', (error) => {
  main.setError(error);
});

const view = (state, actions) => {
  const sessionLogin = password => socket.emit('session login', password);
  const leaveSession = () => {
    actions.resetState();
    socket.emit('session leave', state.username);
  };
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

  let content;
  if (!state.sessionActive) {
    content = (<SingleInput
      placeholder="Enter password to start a session"
      type="password"
      onChange={actions.setSessionPassword}
      onSubmit={sessionLogin}
      value={state.sessionPassword}
    />);
  } else if (!state.usernameConfirmed) {
    content = (<SingleInput
      placeholder="Enter your username"
      onChange={actions.setUsername}
      onSubmit={setUsername}
      value={state.username}
    />);
  } else {
    const current = state.current && state.current.track ? (
      <Current track={state.current.track} />
    ) : null;
    content = state.current && state.queue ? (
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
        <LeaveSession onClick={leaveSession} />
      </main>
    ) : <div>Loading...</div>;
  }

  return (
    <div id="outer-wrapper">
      <Error />
      {content}
    </div>
  );
};

const main = app(state, actions, view, document.body);
