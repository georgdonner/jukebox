// eslint-disable-next-line no-unused-vars
import { h } from 'hyperapp';
import '../scss/queue.scss';

const convertMs = (ms) => {
  const rounded = 1000 * Math.round(ms / 1000);
  const d = new Date(rounded);
  return `${d.getUTCMinutes()}:${d.getUTCSeconds()}`;
};

const Item = ({ track, user }) => (
  <tr key={track.id}>
    <td>{track.name}</td>
    <td>{track.artists.map(a => a.name).join(', ')}</td>
    <td>{track.album.name}</td>
    <td>{convertMs(track.duration_ms)}</td>
    <td>{user}</td>
  </tr>
);

export default ({ queue }) => (
  <div id="queue">
    <table>
      <tr>
        <th>Name</th>
        <th>Artists</th>
        <th>Album</th>
        <th>Duration</th>
        <th>Added by</th>
      </tr>
      {queue.map(item => <Item track={item.track} user={item.user} />)}
    </table>
  </div>
);
