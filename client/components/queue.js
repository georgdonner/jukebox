import { h } from 'hyperapp';
import convertMs from '../utils/convertMs';
import '../scss/queue.scss';

const Item = ({ track, user, mobile }) => {
  const artists = track.artists.map(a => a.name).join(', ');
  return mobile ? (
    <tr key={track.id} class="track-mobile">
      <td>
        <div class="track-name-mobile">{track.name}</div>
        <div class="track-info-mobile">
          {artists}
          <span class="delimiter-mobile">•</span>
          {track.album.name}
        </div>
      </td>
    </tr>
  ) : (
    <tr key={track.id}>
      <td>{track.name}</td>
      <td>{track.artists.map(a => a.name).join(', ')}</td>
      <td>{track.album.name}</td>
      <td>{convertMs(track.duration_ms)}</td>
      <td>{user}</td>
    </tr>
  );
};

export default () => (state) => {
  const mobile = window.matchMedia('(max-width: 1000px)').matches;
  const head = !mobile ? (
    <tr>
      <th>Name</th>
      <th>Artists</th>
      <th>Album</th>
      <th>Duration</th>
      <th>Added by</th>
    </tr>
  ) : null;
  console.log(state.queue);
  const tracks = state.queue.map(item => (
    <Item track={item.track} user={item.user} mobile={mobile} />
  ));
  return (
    <div class="queue">
      <table>
        {head}
        {tracks}
      </table>
    </div>
  );
};
