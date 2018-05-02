import { h } from 'hyperapp';
import '../scss/error.scss';

export default () => (state, actions) => state.error ? (
  <div
    id="error"
    oncreate={() => setTimeout(() => actions.setError(null), 3000)}
  >
    {state.error}
  </div>
) : null;
