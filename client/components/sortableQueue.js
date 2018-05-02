import { h } from 'hyperapp';
import { Sortable } from '@shopify/draggable';
import IconButton from './iconButton';
import convertMs from '../utils/convertMs';
import '../scss/queue.scss';

const Item = ({ track, onRemove, mobile }) => {
  const artists = track.artists.map(a => a.name).join(', ');
  const removeButton = (
    <IconButton
      classes="remove fas fa-trash"
      onClick={() => onRemove(track.id)}
    />
  );
  return mobile ? (
    <tr key={track.id} class="item track-mobile" data-id={track.id}>
      <td>
        <div class="track-name-mobile">{track.name}</div>
        <div class="track-info-mobile">
          {artists}
          <span class="delimiter-mobile">•</span>
          {track.album.name}
        </div>
      </td>
      <td>{removeButton}</td>
    </tr>
  ) : (
    <tr key={track.id} class="item" data-id={track.id}>
      <td>{track.name}</td>
      <td>{artists}</td>
      <td>{track.album.name}</td>
      <td>{convertMs(track.duration_ms)}</td>
      <td>{removeButton}</td>
    </tr>
  );
};

export default ({ user, onReorder, onRemove }) => () => {
  const mobile = window.matchMedia('(max-width: 1000px)').matches;
  const head = !mobile ? (
    <tr>
      <th>Name</th>
      <th>Artists</th>
      <th>Album</th>
      <th>Duration</th>
      <th />
    </tr>
  ) : null;
  const tracks = user.queue.map(track => (
    <Item track={track} onRemove={onRemove} mobile={mobile} />
  ));

  return user.queue.length > 0 ? (
    <div class="queue">
      <div
        oncreate={() => {
          const sortable = new Sortable(document.getElementById('queue-sortable'), {
            draggable: '.item',
          });
          sortable.on('sortable:stop', (e) => {
            const { oldIndex, newIndex } = e.data;
            onReorder(oldIndex, newIndex);
          });
        }}
      >
        <table id="queue-sortable">
          {head}
          {tracks}
        </table>
      </div>
    </div>
  ) : (
    <div class="no-track">No track queued.</div>
  );
};
