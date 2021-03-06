const dbDefaults = require('../config/dbDefaults');

class QueueDb {
  constructor(db) {
    this.db = db;
    this.db.unset('current').write();
    this.db.unset('users').write();
    this.db.unset('session').write();
    this.db.defaults(dbDefaults)
      .write();
  }

  addUser(name) {
    if (this.db.get('users').find({ name }).value()) {
      throw new Error('A user with that username does already exist');
    }
    this.db.get('users')
      .push({ name, queue: [] })
      .write();
  }

  removeUser(username) {
    this.db.get('users')
      .remove({ name: username })
      .write();
  }

  addTrack(username, track) {
    this.db.get('session').assign({ lastUpdate: Date.now() }).write();
    this.db.get('users')
      .find({ name: username })
      .get('queue')
      .push(track)
      .write();
  }

  removeTrack(username, trackId) {
    this.db.get('users')
      .find({ name: username })
      .get('queue')
      .remove({ id: trackId })
      .write();
  }

  getSession() {
    return this.db.get('session').value();
  }

  activateSession() {
    this.db.get('session').assign({ active: true }).write();
  }

  updateQueue(username, oldIndex, newIndex) {
    const queue = this.db.get('users')
      .find({ name: username })
      .get('queue')
      .value();
    const removed = queue.splice(oldIndex, 1);
    queue.splice(newIndex, 0, removed[0]);
    this.db.get('users')
      .find({ name: username })
      .assign({ queue })
      .write();
  }

  getNext() {
    const state = this.db.getState();
    const queue = QueueDb.mergeQueues(state);
    if (queue.length === 0) return null;
    return queue[0].track;
  }

  setNextToCurrent() {
    const state = this.db.getState();
    const queue = QueueDb.mergeQueues(state);
    if (queue.length === 0) return null;
    const { user, track } = queue[0];
    this.db.get('users')
      .find({ name: user })
      .get('queue')
      .shift()
      .write();
    this.db.get('current')
      .assign({ user, track })
      .write();
    return track;
  }

  setCurrentTrack(track) {
    this.db.set('current.track', track).write();
  }

  getPlaying() {
    return this.db.get('current.isPlaying').value();
  }

  setPlaying(isPlaying) {
    this.db.set('current.isPlaying', isPlaying).write();
  }

  setContext(context) {
    this.db.set('context', context).write();
  }

  getContext() {
    return this.db.get('context').value();
  }

  setExternal(isExternal) {
    this.db.set('current.isExternal', isExternal).write();
  }

  isExternal() {
    return this.db.get('current.isExternal').value();
  }

  getCredentials() {
    return this.db.get('credentials').value();
  }

  setCredentials(credentials) {
    return this.db.get('credentials')
      .assign(credentials)
      .write();
  }

  getState() {
    const state = this.db.getState();
    return { ...state, queue: QueueDb.mergeQueues(state) };
  }

  static mergeQueues(state) {
    const { current, users } = state;
    const usersCopy = JSON.parse(JSON.stringify(users));
    const currentUserIndex = users.findIndex(user => user.name === current.user) || 0;
    const sortedUsers = currentUserIndex !== users.length - 1 ?
      usersCopy.slice(currentUserIndex + 1).concat(usersCopy.slice(0, currentUserIndex + 1)) :
      usersCopy;
    const queue = [];
    const queueLengths = users.map(user => user.queue.length);
    const totalTracks = queueLengths.reduce((sum, val) => sum + val, 0);
    let i = 0;
    while (queue.length < totalTracks) {
      // eslint-disable-next-line no-loop-func
      sortedUsers.forEach((user) => {
        if (i < user.queue.length) {
          queue.push({ track: user.queue[i], user: user.name });
        }
      });
      i += 1;
    }
    return queue;
  }
}

module.exports = QueueDb;
