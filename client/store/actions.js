import defaultState from './state';

export default {
  setSessionStatus: status => () => ({ sessionActive: status }),
  setSessionPassword: sessionPassword => () => ({ sessionPassword }),
  queueStateUpdate: newState => (state, actions) => {
    // hard reset to trigger a re-render of the queue (my tracks only, solves DnD issues)
    if (!state.allTracks) actions.updateState({ queue: null, users: null });
    setTimeout(() => {
      actions.updateState(newState);
    }, 0);
  },
  updateState: upd => () => (upd),
  setUsername: username => () => ({ username }),
  confirmUsername: username => () => ({ username, usernameConfirmed: true }),
  setTrackInput: input => () => ({ trackInput: input }),
  setTimeout: timeout => () => ({ timeout }),
  current: {
    setPlaying: isPlaying => () => ({ isPlaying }),
  },
  toggleQueue: () => state => ({ allTracks: !state.allTracks }),
  updateSearchResults: searchResults => (state, actions) => {
    let results = searchResults;
    if (state.fetchingResults && searchResults) {
      results = state.searchResults.concat(searchResults);
    }
    actions.setFetchingResults(false);
    return { searchResults: results };
  },
  setFetchingResults: fetchingResults => () => ({ fetchingResults }),
  setError: error => () => ({ error }),
  resetState: () => () => (Object.assign(defaultState, { sessionActive: true })),
};
