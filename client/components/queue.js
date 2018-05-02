// eslint-disable-next-line no-unused-vars
import { h } from 'hyperapp';
import convertMs from '../utils/convertMs';
import '../scss/queue.scss';

const Item = ({ track, user }) => (
  <tr key={track.id}>
    <td>{track.name}</td>
    <td>{track.artists.map(a => a.name).join(', ')}</td>
    <td>{track.album.name}</td>
    <td>{convertMs(track.duration_ms)}</td>
    <td>{user}</td>
  </tr>
);

export default () => (state) => {
  const tracks = state.queue.map(item => (
    <Item track={item.track} user={item.user} />
  ));
  return (
    <div class="queue">
      <table>
        <tr>
          <th>Name</th>
          <th>Artists</th>
          <th>Album</th>
          <th>Duration</th>
          <th>Added by</th>
        </tr>
        {tracks}
      </table>
    </div>
  );
};
