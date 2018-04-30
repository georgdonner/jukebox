// eslint-disable-next-line no-unused-vars
import { h } from 'hyperapp';
import '../scss/controls.scss';

export default ({
  playing, queue, toggle, next,
}) => (
  <div id="controls">
    <div class="wrapper">
      <i class={`main-control fas fa-${playing ? 'pause' : 'play'}-circle`} onclick={toggle} />
      {queue.length > 0 ? (
        <i id="next" class="fas fa-step-forward" onclick={next} />
      ) : null}
    </div>
  </div>
);
