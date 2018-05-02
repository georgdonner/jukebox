import { h } from 'hyperapp';
import '../scss/input.scss';

export default ({ track, onClick }) => (
  <div
    tabindex="0"
    role="button"
    onclick={() => onClick(track.uri)}
    onkeypress={(e) => {
      if (e.keyCode === 13) { // ENTER
        onClick(track.uri);
      }
    }}
  >
    <span>{track.name}</span>
    <span class="delimiter-mobile">•</span>
    <span>{track.artists.map(a => a.name).join(', ')}</span>
  </div>
);
