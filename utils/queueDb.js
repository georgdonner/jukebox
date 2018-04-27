class QueueDb {
  constructor(db) {
    this.db = db;
    this.db.defaults({ users: [], current: {} })
      .write();
  }

  addUser(id) {
    this.db.get('users')
      .push({ id, queue: [] })
      .write();
  }

  addTrack(userId, track) {
    this.db.get('users')
      .find({ id: userId })
      .get('queue')
      .push(track)
      .write();
  }

  removeUser(id) {
    this.db.get('users')
      .remove({ id })
      .write();
  }
}

module.exports = QueueDb;
