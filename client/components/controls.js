import { h } from 'hyperapp';
import IconButton from './iconButton';
import '../scss/controls.scss';

export default ({
  current, queue, toggle, next,
}) => {
  if (!current.track) {
    if (queue.length > 0) {
      return <button id="start-playback" onclick={next}>Start playback</button>;
    }
    return null;
  }
  return (
    <div id="controls">
      <div class="wrapper">
        <IconButton classes={`main-control fas fa-${current.isPlaying ? 'pause' : 'play'}-circle`} onClick={toggle} />
        <IconButton id="next" classes="fas fa-step-forward" onClick={next} />
      </div>
    </div>
  );
};
