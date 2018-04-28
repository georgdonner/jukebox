class QueueDb {
  constructor(db) {
    this.db = db;
    this.db.defaults({ users: [], current: {} })
      .write();
  }

  addUser(id, username) {
    this.db.get('users')
      .push({ id, username, queue: [] })
      .write();
  }

  removeUser(id) {
    this.db.get('users')
      .remove({ id })
      .write();
  }

  addTrack(userId, track) {
    this.db.get('users')
      .find({ id: userId })
      .get('queue')
      .push(track)
      .write();
  }

  nextTrack() {
    const state = this.db.getState();
    const queue = QueueDb.mergeQueues(state);
    if (queue.length === 0) return null;
    const { userId, track } = queue[0];
    this.db.get('users')
      .find({ id: userId })
      .get('queue')
      .shift()
      .write();
    this.db.get('current')
      .assign({ user: userId, track })
      .write();
    return track;
  }

  getState() {
    const state = this.db.getState();
    return { ...state, queue: QueueDb.mergeQueues(state) };
  }

  static mergeQueues(state) {
    const { current, users } = state;
    const usersCopy = JSON.parse(JSON.stringify(users));
    const currentUserIndex = users.findIndex(user => user.id === current.user) || 0;
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
          queue.push({ track: user.queue[i], user: user.username, userId: user.id });
        }
      });
      i += 1;
    }
    return queue;
  }
}

module.exports = QueueDb;
