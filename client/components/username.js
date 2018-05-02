import { h } from 'hyperapp';

export default ({ onSubmit }) => (state, actions) => (
  <div id="username-container">
    <input
      type="text"
      placeholder="Enter your username"
      value={state.username}
      oninput={(e) => { actions.setUsername(e.target.value); }}
      onkeypress={(e) => {
        if (e.keyCode === 13) onSubmit(state.username);
      }}
    />
  </div>
);
