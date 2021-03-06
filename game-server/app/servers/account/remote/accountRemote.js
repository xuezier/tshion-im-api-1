'use strict';

const crypto = require('crypto');
module.exports = function(app) {
  return new AccountRemote(app);
};

var AccountRemote = function(app) {
  this.app = app;

  this.roomMap = new Map();
  this.chatMap = new Map();

  this.Room = require('../../../models/room')(app);
  this.Account = require('../../../models/account')(app);
  this.User = require('../../../models/user')(app);

  this.ObjectID = app.get('ObjectID');
  this.channelService = app.get('channelService');
  // this.sessionService = app.get('')
};

const prototype = AccountRemote.prototype;

prototype.userInfo = function(query, fields, cb) {
  if (fields instanceof cb) {
    cb = fields;
    fields = {};
  }
  if (query._id) query._id = this.ObjectID(query._id);
  this.User.findUser(query, fields).then(user => {
    cb(null, user);
  }).catch(cb);
};

prototype.login = function(token, cb) {
  // use when need
  this.app.rpc.tlifang.tlifangRemote.login(null, token, function(err, data) {
    if (err) return cb(err);
    cb(null, data);
  });
};

prototype.getChannelId = function(uid, cb) {
  this.app.onlineRedis.get(uid).then(lastcid => {
    cb(null, lastcid);
  }).catch(cb);
};

prototype.setChannelId = function(uid, cid, cb) {
  this.app.onlineRedis.set(uid, cid).then(status => {
    console.log('status:::::::::', status, cid, uid);
    cb(null, status);
  }).catch(cb);
};


prototype.unbindChannel = function(uid, cb) {
  this.app.onlineRedis.del(uid).then(status => {
    cb(null, status);
  }).catch(cb);
};

prototype.bindRoom = function({ uid, target, fcid, target_cid }, cb) {
  let self = this;
  let members = [uid, target].sort();
  const roomHash = crypto.createHash('sha1').update(members.join('*')).digest('hex');

  let roomInner = {
    [uid]: fcid,
    [target]: target_cid
  };
  new self.Room({ roomid: roomHash, members, room: roomInner }).save()
    .then(room => cb(null, room))
    // self.Room.upgradeActive(room)
    // .then(nextRoom => cb(null, nextRoom))
    // .catch(cb))
    .catch(cb);
};

prototype.activeRoom = function(roomid, cb) {
  let self = this;
  self.Room.findRoom({ roomid }).then(room => {
    if (!room) return cb(null);
    return self.Room.upgradeActive(room).then(nextRoom => cb(null, nextRoom));
  }).catch(cb);
};

prototype.unActiveRoom = function(roomid, cb) {
  let self = this;
  self.Room.unActive(roomid).then(result => cb(null, result)).catch(cb);
};

prototype.saveDeviceToken = function(info, cb) {
  let self = this;
  new self.Account(info).saveDeviceToken().then(value => cb(null, value)).catch(cb);
};

prototype.getDeviceToken = function(info, cb) {
  let self = this;
  self.Account.getDeviceToken(info).then(tokens => cb(null, tokens)).catch(cb);
};

prototype.revokeDeviceToken = function(info, cb) {
  let self = this;
  self.Account.delDeviceToken(info).then(result => cb(null, result)).catch(cb);
};

prototype.isBlocked = function(user, friend, cb) {
  this.User.getFriendInfo(user, friend).then(info => {
    if (!info) {
      cb(null, false);
    }

    var status = (info.settings || {}).block;
    if (status == 1) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }).catch(cb);
}

prototype.getFriendInfo = function(user, friend, cb) {
  this.User.getFriendInfo(user, friend).then(info => {
    if (!info) {
      return cb('user not friend');
    }
    cb(null, info);
  }).catch(cb);
}

prototype.findFriends = function(uid) {

};

prototype.express = function(a, b, cb) {
  cb(null, { a, b });
};
