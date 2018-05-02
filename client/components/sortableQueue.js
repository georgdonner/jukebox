// eslint-disable-next-line no-unused-vars
import { h } from 'hyperapp';
import { Sortable } from '@shopify/draggable';
import IconButton from './iconButton';
import convertMs from '../utils/convertMs';
import '../scss/queue.scss';

const Item = ({ track, onRemove }) => (
  <tr key={track.id} class="item" data-id={track.id}>
    <td>{track.name}</td>
    <td>{track.artists.map(a => a.name).join(', ')}</td>
    <td>{track.album.name}</td>
    <td>{convertMs(track.duration_ms)}</td>
    <td>
      <IconButton
        classes="remove fas fa-trash"
        onClick={() => onRemove(track.id)}
      />
    </td>
  </tr>
);

export default ({ user, onReorder, onRemove }) => () => {
  const tracks = user.queue.map(track => <Item track={track} onRemove={onRemove} />);

  return (
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
          <tr>
            <th>Name</th>
            <th>Artists</th>
            <th>Album</th>
            <th>Duration</th>
            <th />
          </tr>
          {tracks}
        </table>
      </div>
    </div>
  );
};
