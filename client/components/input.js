import { h } from 'hyperapp';
import '../scss/input.scss';

export default ({ onSubmit }) => (state, actions) => {
  const submitTrack = (e) => {
    if (e.keyCode === 13) { // ENTER
      actions.setTrackInput('');
      onSubmit();
    }
  };
  return (
    <div id="main-input-container">
      <input
        id="main-input"
        type="text"
        placeholder="Enter a Spotify URI"
        value={state.trackInput}
        oninput={(e) => { actions.setTrackInput(e.target.value); }}
        onkeypress={submitTrack}
      />
      <button
        id="toggle-queue"
        onclick={actions.toggleQueue}
      >
        {state.allTracks ? 'My tracks' : 'All tracks'}
      </button>
    </div>
  );
};
