import { h } from 'hyperapp';

export default ({
  placeholder, onChange, onSubmit, type, value,
}) => (
  <div id="single-input">
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
