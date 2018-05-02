import { h } from 'hyperapp';
import '../scss/current.scss';

export default ({ track }) => (
  <div id="current">
    <img src={track.album.images[1].url} alt={track.album.name} />
    <div id="current-song">{track.name}</div>
    <div id="current-artist">{track.artists.map(a => a.name).join(', ')}</div>
  </div>
);
