import { h } from 'hyperapp';
import IconButton from './iconButton';
import '../scss/controls.scss';

export default ({
  current, queue, toggle, next,
}) => {
  console.log(current);
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
        {queue.length > 0 ? (
          <IconButton id="next" classes="fas fa-step-forward" onClick={next} />
        ) : null}
      </div>
    </div>
  );
};
