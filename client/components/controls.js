// eslint-disable-next-line no-unused-vars
import { h } from 'hyperapp';
import IconButton from './iconButton';
import '../scss/controls.scss';

export default ({
  playing, queue, toggle, next,
}) => (
  <div id="controls">
    <div class="wrapper">
      <IconButton classes={`main-control fas fa-${playing ? 'pause' : 'play'}-circle`} onClick={toggle} />
      {queue.length > 0 ? (
        <IconButton id="next" classes="fas fa-step-forward" onClick={next} />
      ) : null}
    </div>
  </div>
);
