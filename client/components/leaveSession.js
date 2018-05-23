import { h } from 'hyperapp';
import '../scss/main.scss';

export default ({ onClick }) => (
  <button id="leave-session" onclick={onClick}>
    Leave session
  </button>
);
