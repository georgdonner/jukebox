import { h } from 'hyperapp';
import '../scss/header.scss';

export default ({ moreInfo = false }) => (
  <div id="header">
    <h1>Jukebox</h1>
    {moreInfo ? <h2>A queue system for your Spotify party!</h2> : null}
  </div>
);
