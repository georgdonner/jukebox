require('dotenv').config();

if (!process.env.REFRESH_TOKEN) throw Error('No refresh token provided');

const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const checkPlayback = require('./utils/checkPlayback');
const createSocket = require('./utils/createSocket');
const QueueDb = require('./utils/queueDb');
const Spotify = require('./utils/spotify');

const init = async () => {
  const adapter = new FileSync('db.json');
  const lowdb = low(adapter);
  const db = new QueueDb(lowdb);

  const cred = db.getCredentials();
  const accessToken = cred && cred.accessToken ? cred.accessToken : null;
  const spotify = new Spotify(accessToken);

  if (!accessToken) {
    const credentials = await spotify.updateToken();
    db.setCredentials(credentials);
  }

  const app = express();
  const server = http.Server(app);
  const io = createSocket(socketio(server), db, spotify);

  const port = process.env.PORT || 8000;

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Please open http://localhost:${port} in your browser.`);
  });

  app.use(express.static(path.resolve('build')));

  app.get('/', (req, res) => {
    res.sendFile(path.resolve('build', 'index.html'));
  });

  setInterval(() => checkPlayback(io, db, spotify), 5000);

  // keep Heroku server awake
  if (process.env.DYNO) {
    app.get('/wake', (req, res) => res.sendStatus(200));
    const keepAwake = setInterval(() => {
      const { queue } = db.getState();
      const sessionExpired = db.getSession().lastUpdate < Date.now() - (1000 * 60 * 30);
      if (db.getSession().active && queue.length > 0 && !sessionExpired) {
        http.get(`http://localhost:${port}/wake`);
      } else {
        clearInterval(keepAwake);
      }
    }, 10 * 60 * 1000);
  }
};

init();
