import { h } from 'hyperapp';
import Header from './header';

export default ({
  placeholder, onChange, onSubmit, type, value,
}) => (
  <div id="single-input">
    <Header moreInfo />
    <input
      type={type || 'text'}
      placeholder={placeholder || ''}
      value={value}
      oninput={(e) => { onChange(e.target.value); }}
      onkeypress={(e) => {
        if (e.keyCode === 13) onSubmit(value);
      }}
    />
  </div>
);
