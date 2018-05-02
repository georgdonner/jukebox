// eslint-disable-next-line no-unused-vars
import { h } from 'hyperapp';

export default ({ onClick, classes, id }) => (
  <i
    class={classes || ''}
    id={id || ''}
    tabindex="0"
    role="button"
    onclick={onClick}
    onkeypress={(e) => {
      if (e.keyCode === 13) { // ENTER
        onClick();
      }
    }}
    onmousedown={(e) => { e.preventDefault(); }}
  />
);
