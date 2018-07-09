import { h } from 'hyperapp';
import SearchResult from './searchResult';
import '../scss/input.scss';

const isSpotifyUri = input => input.startsWith('spotify') && input.split(':').length === 3;

export default ({ onSearch, onSubmit, fetchMore }) => (state, actions) => {
  const submitTrack = (e) => {
    if (e.keyCode === 13 && isSpotifyUri(state.trackInput)) { // ENTER
      onSubmit();
    }
  };
  const results = state.searchResults ? (
    <div
      id="search-results"
      onscroll={(e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const scrollTopMax = e.target.scrollTopMax || scrollHeight - clientHeight;
        if (
          ((scrollTopMax - scrollTop) < 300) &&
          (state.searchResults.length % 20 === 0) &&
          !state.fetchingResults
        ) {
          fetchMore(state.trackInput);
        }
      }}
    >
      {state.searchResults.map(track => (
        <SearchResult track={track} onClick={onSubmit} />
      ))}
      {state.searchResults.length === 0 ? <div>No results.</div> : null}
    </div>
  ) : null;
  const classes = state.searchResults ? 'not-rounded' : '';
  return (
    <div>
      <div id="main-input-container">
        <input
          id="main-input"
          class={classes}
          type="text"
          placeholder="Search or enter a Spotify URI"
          value={state.trackInput}
          oninput={(e) => {
            const input = e.target.value;
            actions.setTrackInput(input);
            clearTimeout(state.timeout);
            const timeout = setTimeout(() => {
              if (input.length > 2 && !isSpotifyUri(input)) {
                onSearch(input);
                const resultsContainer = document.getElementById('search-results');
                if (resultsContainer) resultsContainer.scrollTop = 0;
              }
            }, 250);
            actions.setTimeout(timeout);
          }}
          onkeypress={submitTrack}
        />
        <button
          class={classes}
          id="toggle-queue"
          onclick={actions.toggleQueue}
        >
          {state.allTracks ? 'My tracks' : 'All tracks'}
        </button>
      </div>
      {results}
    </div>
  );
};
